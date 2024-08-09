const currentDateTime = document.querySelectorAll('.currentDateTime');//0 -> arabDate, 1 -> day , 2 -> eng Date
const currentDateTimeAssign = [];
const city = document.querySelector('.city');
const next9lah = document.querySelectorAll('.next9lah');// 0 => data for the next. 1 => how many time left to reach the 9lah;
const infoGeneral = document.querySelector('.generalInfo');
const clock = document.querySelector('.clock');
let lat, lot;
let x = new Date();
let y = `${x.getDate() >= 10 ? `${x.getDate()}` : `0${x.getDate()}`}-${(x.getMonth() + 1) >= 10 ? `${x.getMonth() + 1}` : `0${x.getMonth() + 1}`}-${x.getFullYear()}`;
let timings;
async function start() {
    

    clock.innerHTML = getclock();
    setInterval(() => {
        clock.innerHTML = getclock();
    }, 1000);

    // function getLocation() {
    //     if (navigator.geolocation) {
    //       navigator.geolocation.getCurrentPosition(showPosition);
    //     } else {
    //       x.innerHTML = "Geolocation is not supported by this browser.";
    //     }
    //   }

    //   function showPosition(position) {
    //     x.innerHTML = "Latitude: " + position.coords.latitude +
    //     "<br>Longitude: " + position.coords.longitude;
    //   }




    await setLatLot();




}

window.onload = start



async function setLatLot() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            lat = pos.coords.latitude;
            lot = pos.coords.longitude;
            getData();

        });

    }
}



async function getData() {
    console.log(`lat: ${lat}`);
    console.log(`lot: ${lot}`);
    // console.log(`y: ${y}`)


    let data = await fetch(`https://api.aladhan.com/v1/timings/${y}?latitude=${lat}&longitude=${lot}&method=4`);
    data = await data.json();
    let dar = await fetch(`https://api.aladhan.com/v1/gToH/${y}?adjustment=2`);
    dar = await dar.json();

    //setting the dateAr and Eng and day
    currentDateTimeAssign[0] = `${Number(dar.data.hijri.day)} ${data.data.date.hijri.month.ar}`; // 2 صفر
    currentDateTimeAssign[1] = data.data.date.hijri.weekday.ar;
    currentDateTimeAssign[2] = y;

    currentDateTime.forEach((e, i) => {
        e.innerHTML = currentDateTimeAssign[i];
    });

    //city assign 
    let data2 = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lot}&key=61c2db3c31ba4770866bf0ca7f7764f0&include=minutely`);
    data2 = await data2.json();
    city.innerHTML = data2.data[0].city_name;


    //assign prary times;
     timings = [
        { time: data.data.timings.Fajr, time12sys: to12sys(data.data.timings.Fajr), obj: document.querySelectorAll('.prayTime')[0], ar: 'الفجر' },
        { time: data.data.timings.Dhuhr, time12sys: to12sys(data.data.timings.Dhuhr), obj: document.querySelectorAll('.prayTime')[1], ar: 'الظهر' },
        { time: data.data.timings.Maghrib, time12sys: to12sys(data.data.timings.Maghrib), obj: document.querySelectorAll('.prayTime')[2], ar: 'المغرب' },
        { time: data.data.timings.Midnight, time12sys: to12sys(data.data.timings.Midnight), obj: document.querySelectorAll('.prayTime')[3], ar: 'منتصف الليل' },
        { time: data.data.timings.Sunrise, time12sys: to12sys(data.data.timings.Sunrise), obj: document.querySelectorAll('.prayTime')[4], ar: 'الشروق' },
        { time: data.data.timings.Asr, time12sys: to12sys(data.data.timings.Asr), obj: document.querySelectorAll('.prayTime')[5], ar: 'العصر' },
        { time: data.data.timings.Isha, time12sys: to12sys(data.data.timings.Isha), obj: document.querySelectorAll('.prayTime')[6], ar: 'العشاء' },
        { time: data.data.timings.Lastthird, time12sys: to12sys(data.data.timings.Lastthird), obj: document.querySelectorAll('.prayTime')[7], ar: 'الثلث الاخير من الليل' }
    ];

    timings.forEach((e, i) => {
        e.obj.children[1].innerHTML = e.time12sys;
        if (Number(`${e.time[0]}${e.time[1]}`) >= 12) {
            e.obj.children[2].innerHTML = 'مساء';
        }
    })

    //assign next 9lah
    //update the box with قبل او بعد
    setBox();
    const boxUpdate = setInterval(() => {
        let minimum = minimum2 = 99999999;
        let prevEvent = nextEvent = null;
        let h = m = null;
        const currentTime = new Date();
        const currentTimeInSec = (currentTime.getHours() * 3600) + (currentTime.getMinutes() * 60) + (currentTime.getSeconds());
        // const currentTimeInSec = (5 * 3600) + (45 * 60);

        timings.forEach(e => {
            let objTimeSec = Number(e.time[0] + e.time[1]) * 3600 + Number(e.time[3] + e.time[4]) * 60;
            if (Math.abs(currentTimeInSec - objTimeSec) < minimum && currentTimeInSec < objTimeSec) {
                minimum = Math.abs(currentTimeInSec - objTimeSec);
                nextEvent = e;
            }

            if (Math.abs(currentTimeInSec - objTimeSec) < minimum2 && objTimeSec < currentTimeInSec) {
                minimum2 = Math.abs(currentTimeInSec - objTimeSec);
                prevEvent = e;
            }

        });
        

        
       
        if (nextEvent == null) {
            timings.forEach(e => {
                let objTimeSec = Number(e.time[0] + e.time[1]) * 3600 + Number(e.time[3] + e.time[4]) * 60;
                if (objTimeSec < minimum) {
                    minimum = objTimeSec;
                    nextEvent = e;
                }
            })
            minimum += (Math.abs(currentTimeInSec - ((23 * 3600) + (59 * 60) + 60)));
        }

        
        h = Math.floor(minimum / 3600);
        minimum = minimum % 3600;
        m = Math.floor(minimum / 60);
        m = m >= 10 ? m :`0${m}`;
        minimum = minimum % 60;
        minimum = minimum >= 10 ? minimum :`0${minimum}`;
        next9lah[0].innerHTML = nextEvent.ar + ' ' + 'بعد';
        next9lah[1].innerHTML = `${h}:${m}:${minimum}`;
        
        
        

        if (prevEvent == null) {
            minimum2 = -1;
            timings.forEach(e => {
                let objTimeSec = Number(e.time[0] + e.time[1]) * 3600 + Number(e.time[3] + e.time[4]) * 60;
                if (objTimeSec > minimum2) {
                    minimum2 = objTimeSec;
                    prevEvent = e;
                }
            })
            minimum2 = (Math.abs(minimum2 - ((23 * 3600) + (59 * 60) + 60))) + currentTimeInSec;
        }

        
        
        
        if (minimum2 < 1200) {
            h = Math.floor(minimum2 / 3600);
            minimum = minimum2 % 3600;
            m = Math.floor(minimum2 / 60);
            m = m >= 10? m : `0${m}`;
            minimum2 = minimum2 % 60;
            minimum2 = minimum2 >= 10 ? minimum2 : `0${minimum2}`;
            infoGeneral.innerHTML = prevEvent.ar + ' ' + 'قبل';
            infoGeneral.innerHTML += `${h}:${m}:${minimum2}`;
            infoGeneral.classList.add('attent');
            prevEvent.obj.classList.add('attent');
            
        }
        else {

            infoGeneral.innerHTML = 'اللهم صلِ على محمد'
            infoGeneral.classList.remove('attent');
            prevEvent.obj.classList.remove('attent');
        }


    }, 1000)









}







function setBox(){
    
        let minimum = minimum2 = 99999999;
        let prevEvent = nextEvent = null;
        let h = m = null;
        const currentTime = new Date();
        const currentTimeInSec = (currentTime.getHours() * 3600) + (currentTime.getMinutes() * 60) + (currentTime.getSeconds());
        // const currentTimeInSec = (5 * 3600) + (45 * 60);

        timings.forEach(e => {
            let objTimeSec = Number(e.time[0] + e.time[1]) * 3600 + Number(e.time[3] + e.time[4]) * 60;
            if (Math.abs(currentTimeInSec - objTimeSec) < minimum && currentTimeInSec < objTimeSec) {
                minimum = Math.abs(currentTimeInSec - objTimeSec);
                nextEvent = e;
            }

            if (Math.abs(currentTimeInSec - objTimeSec) < minimum2 && objTimeSec < currentTimeInSec) {
                minimum2 = Math.abs(currentTimeInSec - objTimeSec);
                prevEvent = e;
            }

        });
        

        
       
        if (nextEvent == null) {
            timings.forEach(e => {
                let objTimeSec = Number(e.time[0] + e.time[1]) * 3600 + Number(e.time[3] + e.time[4]) * 60;
                if (objTimeSec < minimum) {
                    minimum = objTimeSec;
                    nextEvent = e;
                }
            })
            minimum += (Math.abs(currentTimeInSec - ((23 * 3600) + (59 * 60) + 60)));
        }

        
        h = Math.floor(minimum / 3600);
        minimum = minimum % 3600;
        m = Math.floor(minimum / 60);
        m = m >= 10 ? m :`0${m}`;
        minimum = minimum % 60;
        minimum = minimum >= 10 ? minimum :`0${minimum}`;
        next9lah[0].innerHTML = nextEvent.ar + ' ' + 'بعد';
        next9lah[1].innerHTML = `${h}:${m}:${minimum}`;
        
        
        

        if (prevEvent == null) {
            minimum2 = -1;
            timings.forEach(e => {
                let objTimeSec = Number(e.time[0] + e.time[1]) * 3600 + Number(e.time[3] + e.time[4]) * 60;
                if (objTimeSec > minimum2) {
                    minimum2 = objTimeSec;
                    prevEvent = e;
                }
            })
            minimum2 = (Math.abs(minimum2 - ((23 * 3600) + (59 * 60) + 60))) + currentTimeInSec;
        }

        
        
        
        if (minimum2 < 1200) {
            h = Math.floor(minimum2 / 3600);
            minimum = minimum2 % 3600;
            m = Math.floor(minimum2 / 60);
            m = m >= 10? m : `0${m}`;
            minimum2 = minimum2 % 60;
            minimum2 = minimum2 >= 10 ? minimum2 : `0${minimum2}`;
            infoGeneral.innerHTML = prevEvent.ar + ' ' + 'قبل';
            infoGeneral.innerHTML += `${h}:${m}:${minimum2}`;
            infoGeneral.classList.add('attent');
            prevEvent.obj.classList.add('attent');
            
        }
        else {

            infoGeneral.innerHTML = 'اللهم صلِ على محمد'
            infoGeneral.classList.remove('attent');
            prevEvent.obj.classList.remove('attent');
        }


    
}






















function getclock() {
    let x = new Date();
    let m = x.getMinutes() < 10 ? `0${x.getMinutes()}` : x.getMinutes();
    let s = x.getSeconds() < 10 ? `0${x.getSeconds()}` : x.getSeconds();
    let h = x.getHours();
    if (h >= 13) {
        h -= 12;
        return `${h}:${m}:${s} م`
    }
    else if (h == 0) {
        h = 12;
        return `${h}:${m}:${s} ص`
    }

    else {
        return `${h}:${m}:${s} ص`;
    }
}

function to12sys(hourStr) {
    let newHour;
    let hour = Number(`${hourStr[0]}${hourStr[1]}`);
    if (hour >= 13) {
        newHour = hour - 12
        return `${newHour}${hourStr.slice(2)}`;
    }
    else if (hour == 0) return `12${hourStr.slice(2)}`;
    else return hourStr;

}


