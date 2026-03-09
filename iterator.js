//simple iterator
const iter = {
[Symbol.iterator]() {    
const iterator = {
    number: 0,
    next() {
        return {
            value: this.number++,
            done: this.number > 4,
        };
      }
   }; 
   return iterator;
  } 
}
const iterator = iter[Symbol.iterator]();
const n1 = iterator.next().value;
const n2 = iterator.next().value;
const n3 = iterator.next().value;
const n4 = iterator.next().value;
console.log({n1, n2, n3, n4});

for(const nums of iter);
console.log({nums: [...iter]});

//Main iterator
console.log("Iterator:");

function rangeNum(start, end) {
let now = start;
return {
    next() {
        if(now <= end) {
            return {
                value: now++,
                done: false
            };
        }
        else {
            return {
                value: undefined,
                done: true 
            };
        }
     }
   };
}

const toFrom = rangeNum(0, 2);
console.log(toFrom.next());
console.log(toFrom.next());
console.log(toFrom.next());
console.log(toFrom.next());

//Iterator from lab 
console.log("Iterator from lab:")
const Animals = {
    animals: ["Monkey", "Dog", "Zebra", "Alligator", "Hornet"],
    [Symbol.iterator]() {
        let order = 0;
        const animals = this.animals;
        return {
        next() { 
         if(order < animals.length) {
            return {value: animals[order++], done: false};
         }
         else { return {value: undefined, done: true}; }
        } 
    }; 
  }
}

for(const animal of Animals) {
    console.log(animal);
}
function busyWait(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
}

function timeoutIterator(iterator, Seconds) {
    const start = Date.now();
    const timeoutMs = Seconds * 1000;
    let count = 0;
    
    console.log(`Start ${Seconds} sec`);

    for (const value of iterator) {
        busyWait(300);

        const elapsed = Date.now() - start;
        if (elapsed >= timeoutMs) {
            break;
        }

        count++;
        console.log(`${count}. ${value}`);
    }

    const totalTime = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Animals: ${count}, Time: ${totalTime} seconds`);
}

timeoutIterator(Animals, 1); 