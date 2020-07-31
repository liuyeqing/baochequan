

function add0(num){
  return num < 10 ? `0${num}` : num;
}

let year = new Date().getFullYear();
let month = add0(new Date().getMonth() + 1);
let day = add0(new Date().getDate());
let hour =  add0(new Date().getHours());
let minute =  add0(new Date().getMinutes());
let second =  add0(new Date().getSeconds());


function get_time(){
  console.log('year', year, 'month', month, 'day', day, 'hour', hour, 'minute', minute, 'second', second);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}