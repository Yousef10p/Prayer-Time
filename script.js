function start() {

    const currentDateTime = document.querySelectorAll('.currentDateTime');//0 -> arabDate, 1 -> day , 2 -> eng Date
    const currentDateTimeAssign = [];

    const clock = document.querySelector('.clock');
    clock.innerHTML = getclock();
    setInterval(() => {
        clock.innerHTML = getclock();
    }, 1000)


    const city = document.querySelector('.city');
    const next9lah = document.querySelectorAll('.next9lah');// 0 => data for the next. 1 => how many time left to reach the 9lah;
    const infoGeneral = document.querySelector('.generalInfo');

    let lat, lot;

    let x = new Date();
    let y = `${x.getDate() >= 10 ? `${x.getDate()}` : `0${x.getDate()}`}-${(x.getMonth() + 1) >= 10 ? `${x.getMonth() + 1}` : `0${x.getMonth() + 1}`}-${x.getFullYear()}`;

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


    async function setLatLot() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                lat = pos.coords.latitude;
                lot = pos.coords.longitude;
                getData();
            });

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

    setLatLot();
    async function getData() {
        console.log(`lat: ${lat}`);
        console.log(`lot: ${lot}`);
        // console.log(`y: ${y}`)


        let data = await fetch(`https://api.aladhan.com/v1/timings/${y}?latitude=${lat}&longitude=${lot}&method=4`);
        data = await data.json();

        //setting the dateAr and Eng and day
        currentDateTimeAssign[0] = `${Number(data.data.date.hijri.day)} ${data.data.date.hijri.month.ar}`; // 2 صفر
        currentDateTimeAssign[1] = data.data.date.hijri.weekday.ar;
        currentDateTimeAssign[2] = y;

        currentDateTime.forEach((e, i) => {
            e.innerHTML = currentDateTimeAssign[i];
        });

        


        //assign prary times;
        let timings = [
            { time: data.data.timings.Fajr, time12sys: to12sys(data.data.timings.Fajr), obj: document.querySelectorAll('.prayTime')[0], ar: 'الفجر' },
            { time: data.data.timings.Dhuhr, time12sys: to12sys(data.data.timings.Dhuhr), obj: document.querySelectorAll('.prayTime')[1], ar: 'الظهر' },
            { time: data.data.timings.Maghrib, time12sys: to12sys(data.data.timings.Maghrib), obj: document.querySelectorAll('.prayTime')[2], ar: 'المغرب' },
            { time: data.data.timings.Midnight, time12sys: to12sys(data.data.timings.Midnight), obj: document.querySelectorAll('.prayTime')[3], ar: 'منتصف اللليل' },
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
        let min = 999999;
        let nd = new Date();
        let currentInSec = (nd.getHours() * 60 * 60) + (nd.getMinutes() * 60) + (nd.getSeconds());

        let obj = null, obj2 = null;
        timings.forEach(e => {//next event
            if (Math.abs(currentInSec - ((Number(e.time[0] + e.time[1])) * 3600 + (Number(e.time[3] + e.time[4]) * 60))) < min && ((Number(e.time[0] + e.time[1])) * 3600 + (Number(e.time[3] + e.time[4]) * 60)) > currentInSec) {
                min = Math.abs(currentInSec - ((Number(e.time[0] + e.time[1])) * 3600 + (Number(e.time[3] + e.time[4]) * 60)))
                obj = e;
            }
        });
        min = 999999;
        timings.forEach(e => {//prev event
            if (Math.abs(currentInSec - ((Number(e.time[0] + e.time[1])) * 3600 + (Number(e.time[3] + e.time[4]) * 60))) < min && ((Number(e.time[0] + e.time[1])) * 3600 + (Number(e.time[3] + e.time[4]) * 60)) < currentInSec) {
                min = Math.abs(currentInSec - ((Number(e.time[0] + e.time[1])) * 3600 + (Number(e.time[3] + e.time[4]) * 60)))
                obj2 = e;
            }
        });



        if (currentInSec - ((Number(obj2.time[0] + obj2.time[1])) * 3600 + (Number(obj2.time[3] + obj2.time[4]) * 60)) < 1200) {
            let targetInSecPrev = (Number(`${obj2.time[0]}${obj2.time[1]}`) * 60 * 60) + (Number(`${obj2.time[3]}${obj2.time[4]}`) * 60) + 0;
            setInterval(() => {//time left for the prev event
                let nd = new Date();
                let currentInSec = (nd.getHours() * 60 * 60) + (nd.getMinutes() * 60) + (nd.getSeconds());
                let difInSec = currentInSec - targetInSecPrev;
                let h = Math.floor(difInSec / 3600);
                difInSec = difInSec % 3600;
                let m = Math.floor(difInSec / 60);
                m = m < 10 ? `0${m}` : m;
                difInSec = difInSec % 60;
                difInSec = difInSec < 10 ? `0${difInSec}` : difInSec;
                let clockLeft = `${h}:${m}:${difInSec}`;
                next9lah[1].innerHTML = clockLeft;
            }, 1000)

            next9lah[0].innerHTML = `${obj2.ar}  قبل `;
            obj.obj.classList.remove('attent');
            obj2.obj.classList.add('attent');
        }
        else {
            let targetInSecNext = (Number(`${obj.time[0]}${obj.time[1]}`) * 60 * 60) + (Number(`${obj.time[3]}${obj.time[4]}`) * 60) + 0;
            setInterval(() => {//time left for the next event
                let nd = new Date();
                let currentInSec = (nd.getHours() * 60 * 60) + (nd.getMinutes() * 60) + (nd.getSeconds());
                let difInSec = targetInSecNext - currentInSec;
                let h = Math.floor(difInSec / 3600);
                difInSec = difInSec % 3600;
                let m = Math.floor(difInSec / 60);
                m = m < 10 ? `0${m}` : m;
                difInSec = difInSec % 60;
                difInSec = difInSec < 10 ? `0${difInSec}` : difInSec;
                let clockLeft = `${h}:${m}:${difInSec}`;
                next9lah[1].innerHTML = clockLeft;
            }, 1000)
            next9lah[0].innerHTML = `${obj.ar}  بعد `;
            obj.obj.classList.add('attent');
            obj2.obj.classList.remove('attent');
        }


        infoGeneral.innerHTML = 'اللهم صلِ على نبينا محمد'


        //city assign (delayed)..............
         data = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lot}&key=61c2db3c31ba4770866bf0ca7f7764f0&include=minutely`);
         data = await data.json();
         city.innerHTML = data.data[0].city_name;
         
         

    }

    
    
}

window.onload = start