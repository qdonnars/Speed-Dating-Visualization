//TODO : Mise en cache des variables deja calculées

////////////////////////// Data //////////////////////////////
let display_requests_history = []; // liste des couples question, time, gender requétés
let data_displayed = []; // liste d'objets displayed
let dataset = []; // le dataset complet loadé à l'initialisation de la page
let legendOptions = [];

let possible_couples = ['1_1', '1_2', '1_3', // les couples requetables possibles (données disponible dans le data set)
                        '2_1', '2_2', '2_3',
                        '3_1', '3_2', '3_3',
                        '4_1', '4_2', '4_3',
                        '5_1', '5_2', '5_3',
                        '7_2', '7_3'];

// building option for relevant interactive labels on graph
let liste_questions = { '1' : ['What', 'think', 0, 'they look for'],
                        '2' : ['What','think', -1,  'look for'],
                        '3' : ['How', 'think', 0, 'they measure up'],
                        '4' : ['How',  'think', 1, 'look for'],
                        '5' : ['How', 'think', -1, 'measure them'],
                        '7' : ['On what', 'took their', 0, 'decision with hindsight']};

let liste_time = {'1' : 'at the start of speed dating.',
                  '2' : 'at the end of speed dating.',
                  '3' : '3 weeks after the speed dating.'};

let liste_genre = ['Women', 'Men'];
let liste_genre_1 = ['Men', 'Women']; // dans l'autre sens afin de pouvoir faire fonctionner la fonciton getAppropriateGenderForLegend()

let number_of_graphs = 0; // nombre de charts affichés simultanément
let gender = '-1'; // genre de la requette
let time = '-1'; // horizon temporelle de la requette
let question = '-1'; // question de la requette

function getAppropriateGenderForLegend(gender, d){
  if(d == 1){
    return liste_genre[gender] + ' ';}
  if(d == 0){
    return ' ';}
  if(d == -1){
    return liste_genre_1[gender] + ' ';}
}

function getLengendAssociated(gender, time, question){
  console.log('order to display', gender, time, question);
  let awnser = liste_questions[question][0] + ' ' + liste_genre[gender] + ' '  // how gender
              + liste_questions[question][1] + ' ' // think or took their
              + getAppropriateGenderForLegend(gender, liste_questions[question][2]) // mens, womens or Nothing
              + liste_questions[question][3] + ' ' + liste_time[time]

  console.log(awnser);
  return awnser;
}

function updateQuery(gender, time, question) { // called by html onClick funciton
  if(gender == '-1' ||  time == '-1'){
    alert('Veuillez selectioner un genre et un instant');
  }
  else{
    let request = {'id':number_of_graphs, 'gender' : gender, 'question' : question, 'time' : time}
    display_requests_history[number_of_graphs] = request // GLOBAL VARIABLE UPDATE
    draw(dataset, request);
  }
}

function clearQuery(){
  display_requests_history = []; // GLOBAL VARIABLE UPDATE
  data_displayed = []; // GLOBAL VARIABLE UPDATE
  number_of_graphs = 0; // GLOBAL VARIABLE UPDATE
  legendOptions = [];
  updateQuery(gender, time, question);
}

function change_data_10_to_100(data_to_change){
  var sum = 0;
  for(let i of data_to_change){
    sum += i.value;
  }
  for(let a in data_to_change){
    data_to_change[a].value = Math.round((data_to_change[a].value * 100)/sum * 100) / 100;
  }
  return data_to_change;
}


function create_list_on_demand(gender, time, question, rows){
  // consider the question in order to know how many output to give
  mean_attr = d3.mean(rows, function(d) {if(d.gender == gender && d.wave >= 10){return +d['attr' + question + '_' + time]}});
  mean_sinc = d3.mean(rows, function(d) {if(d.gender == gender && d.wave >= 10){return +d['sinc' + question + '_' + time]}});
  mean_intel = d3.mean(rows, function(d) {if(d.gender == gender && d.wave >= 10){return +d['intel' + question + '_' + time]}});
  mean_fun = d3.mean(rows, function(d) {if(d.gender == gender && d.wave >= 10){return +d['fun' + question + '_' + time]}});
  mean_amb = d3.mean(rows, function(d) {if(d.gender == gender && d.wave >= 10){return +d['amb' + question + '_' + time]}});
  mean_shar = d3.mean(rows, function(d) {if(d.gender == gender && d.wave >= 10){return +d['shar' + question + '_' + time]}});

  let responce = [
    {axis:"Beauty",value:mean_attr},
    {axis:"Fun", value: mean_fun},
    {axis:"Inteligence",value:mean_intel},
    {axis:"Ambition",value:mean_amb},
    {axis:"Sincerity",value:mean_sinc}
  ];

  if (typeof mean_shar !== "undefined"){
    responce.push({axis:"Common Interest",value : mean_shar});
  }

  return change_data_10_to_100(responce);
}

function draw(rows, request){
  console.log(request);
  if(possible_couples.includes(request['question'] + '_' + request['time'])){
    try{
      data_displayed[request['id']] = create_list_on_demand(request['gender'], // GLOBAL VARIABLE UPDATE & USE OF GLOBAL VARIABLE
       request['time'], request['question'], rows); // GLOBAL VARIABLE UPDATE & USE OF GLOBAL VARIABLE

      legendOptions = legendOptions.concat([getLengendAssociated(request['gender'], request['time'], request['question'])]); // GLOBAL VARIABLE UPDATE

    }
    catch(error){
      console.error(error);
      console.log('error raised in try loop with this request : ', request);
      alert("No values aviables for this combinaison");
    }
  }
  else{
    alert("The desired combinaison doesn't exist");
  }

  //////////////////// Draw the Chart //////////////////////////
  var color = d3.scale.category10()
  var radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: 0,
    levels: 5,
    roundStrokes: true,
    color: color
  };
  //Call function to draw the Radar chart
  console.log('display', data_displayed)
  RadarChart(".radarChart", data_displayed, radarChartOptions, legendOptions);
  number_of_graphs += 1 // GLOBAL VARIABLE UPDATE
}

function load_specific_attributes(d, couple){
  let list_attributes = {
      ['attr' + couple]: d['attr' + couple],
      ['sinc' + couple]: +d['sinc' + couple],
      ['intel' + couple]: +d['intel' + couple],
      ['fun' + couple]: +d['fun' + couple],
      ['amb' + couple]: +d['amb' + couple],
      ['shar' + couple]: +d['shar' + couple]
  };
  return list_attributes;
}

function get_attributes_from_rows(d,i){
  let list_question_attributes = {
    person_id: +d.iid,
    gender: +d.gender,
    partner_id: +d.pid,
    match: +d.match,
    age: +d.age,
    wave: +d.wave
  };
  for(let couple of possible_couples){
    list_question_attributes = Object.assign({},
      list_question_attributes,
      load_specific_attributes(d, couple)
    );
  }
  return list_question_attributes;
}

d3.tsv("data/SpeedDating.tsv")
.row((d,i) => {return get_attributes_from_rows(d,i);})
.get((error, rows) => {
  if (rows.length > 0){
    dataset = rows; // GLOBAL VARIABLE UPDATE
  }
});
