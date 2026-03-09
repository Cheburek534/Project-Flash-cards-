//Simple generator
function* daysOfTheWeek1() {
yield 'Sunday';
yield 'Monday';
yield 'Tuesday';
yield 'Wednesday';
yield 'Thursday';
yield 'Friday';
yield 'Saturday';
}

const day = daysOfTheWeek1();
console.log(day.next().value);
console.log(day.next().value);
console.log(day.next().value);
console.log(day.next().value);
console.log(day.next().value);
console.log(day.next().value);
console.log(day.next().value);
console.log(day.next().done);

//Generator
console.log("Main generator:");
function* daysOfTheWeek() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
    let sequence = 0;
    while(sequence < days.length) {
        yield days[sequence];
        sequence = sequence + 1;
        if(sequence >= days.length) {
            sequence = 0;
        }
    }
}

const dWeek = daysOfTheWeek();

let count = 0;
for(const dw of dWeek) {
    console.log(dw);
    count++;
    if(count == 7) {
        break;
    }
}

// for(dw of dWeek) {
//    console.log(dWeek.next().value);
// }                                    //infinite generator

// for(let i = 0; i < 8; i++) {
//     console.log(dWeek.next().value); 
// }                                    //generator with for(i)