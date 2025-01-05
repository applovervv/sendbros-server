import leftPad from 'left-pad';

function randomID(length:number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
  
function randomIntFromInterval(min:number, max:number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateAuthCode = () => {
  return leftPad(randomIntFromInterval(0, 99999999), 8, '0');
};

export {
    randomID,
    randomIntFromInterval,
};
  
