'use strict';

class Stopwatch{ // 作業時間ストップウォッチのデータを格納. 
    constructor(display, displayTotal, startStopButton, resetButton, tm, r){
        this.display = display; // 作業時間を表示するための変数. 
        this.prevElapsedTime = 0; // 前回の経過時間. 

        this.displayTotal = displayTotal; // 総作業時間を表示するための変数. 
        this.totalElapsedTime = 0; // ストップウォッチの合計時間. 
        this.prevTotalElapsedTime = 0; // 前回のストップウォッチの合計時間. 

        this.startStopButton = startStopButton; // 作業開始・中断ボタン. 
        this.startTime; // 開始時刻. 
        this.running = false; // ストップウォッチが動いているなら真. 
        this.tInterval;

        this.resetButton = resetButton; // リセットボタン. 

        this.tm = tm; // Timerクラスのインスタンスを格納. 
        this.r = r; // 作業時間と加算する休憩時間の比率. 
    }

    startStop(){ // 作業開始・中断ボタンを押すと呼び出される. 
        if(!this.running){ // 作業を開始するとき. 
            if(this.tm.running){ // 休憩が進行中なら, 休憩を中断. 
                this.tm.startStop(); 
            }

            this.startTime = new Date().getTime();
            this.tInterval = setInterval(() => this.update(), 1); // 1ミリ秒毎にupdate関数を呼び出して実行. 
            this.startStopButton.innerHTML = '作業中断';

            this.startStopButton.classList.add('btn-pressed'); // ボタンが押し込まれた状態にする. 
            this.running = true;
        }else{ // 作業を中断するとき. 
            const stopTime = new Date().getTime();
            clearInterval(this.tInterval);
    
            this.prevElapsedTime += stopTime - this.startTime; // 作業時間を更新. 
            this.prevTotalElapsedTime = this.totalElapsedTime; // 合計作業時間を更新. 
    
            this.startStopButton.innerHTML = '作業開始';
            this.startStopButton.classList.remove('btn-pressed'); // ボタンが押し込まれた状態を解除する. 
            this.running = false;
        }
    }

    update(){ // 経過時間を更新する関数. 
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - this.startTime + this.prevElapsedTime;
        this.totalElapsedTime =  currentTime - this.startTime + this.prevTotalElapsedTime;
    
        this.displayElapsedTime(elapsedTime);
        this.displayTotalElapsedTime(this.totalElapsedTime);
    }

    reset(){
        if(this.tm.running){
            this.tm.startStop();
        }else{
            if(this.running){
                this.startStop();
            }

            this.tm.addBreakTime(this.prevElapsedTime, this.r); // 休憩時間を加算

            this.prevElapsedTime = 0; // 作業時間をリセット. 
        
            this.display.innerHTML = `
            00
            <font size="6"> h </font>
            00
            <font size="6"> min </font>
            `;
        }
    }

    displayElapsedTime(time){
        let hours = Math.floor(time / (3600*1000));
        hours = (hours <= 9) ? `0${hours}` : `${hours}`;
        let minutes = Math.floor(time % (3600*1000) / (60*1000));
        minutes = (minutes <= 9) ? `0${minutes}` : `${minutes}`;
        let seconds = Math.floor(time % (3600*1000) % (60*1000) / 1000);
        seconds = (seconds <= 9) ? `0${seconds}` : `${seconds}`;
        this.display.innerHTML = `
            ${hours}
            <font size="6"> h </font>
            ${minutes}
            <font size="6"> min </font>
        `;
    }
    
    displayTotalElapsedTime(time){
        let hours = Math.floor(time / (3600*1000));
        hours = (hours < 10) ? `0${hours}` : hours;
        let minutes = Math.floor(time % (3600*1000) / (60*1000));
        minutes = (minutes <10) ? `0${minutes}` : minutes;
        let seconds = Math.floor(time % (3600*1000) % (60*1000) / 1000);
        seconds = (seconds <10) ? `0${seconds}` : seconds;
        this.displayTotal.innerHTML = `
        ${hours}
        <font size="2"> h </font>
        ${minutes}
        <font size="2"> min </font>
        `;
    }    
}

class Timer{ // 休憩時間タイマーに用いるデータを格納. 
    constructor(display, displayTotal, startStopButton){
        this.display = display; // 現在の残り休憩時間を表示するための変数. 
        this.remainingTime;
        this.prevRemainingTime; // スタート、ストップ時の残り時間を格納. 
        
        this.displayTotal = displayTotal; // これまで休憩した時間+残り休憩時間を表示するための変数. 
        this.totalRemainingTime;

        this.startStopButton = startStopButton;
        this.startTime; // 「休憩開始」を押した時刻. 
        this.running = false; // 休憩時間が減少中なら真. 
        this.tInterval;

        this.sw;
    }

    startStop(){  
        if(!this.running){
            if(this.sw.running){ // 作業時間が進行中なら, 中断する. 
                // this.sw.reset();
                this.sw.startStop();
            }
            this.prevRemainingTime = this.remainingTime;
            this.startTime = new Date().getTime();
            this.tInterval = setInterval(() => this.update(), 1);
            this.startStopButton.innerHTML = '休憩中断';
            this.startStopButton.classList.add('btn-pressed'); // ボタンが押し込まれた状態（色が濃い状態）にする. 
            this.running = true;
        }else{
            this.prevRemainingTime = this.remainingTime; // これはおそらく不要
            clearInterval(this.tInterval);
            this.startStopButton.innerHTML = '休憩開始';
            this.startStopButton.classList.remove('btn-pressed'); // ボタンが押し込まれた状態を解除. 
            this.running = false;
        }
    }
    
    update(){
        const currentTime = new Date().getTime();
        this.remainingTime = this.prevRemainingTime - (currentTime - this.startTime);

        if(this.remainingTime <= 0){
            clearInterval(this.tInterval);
            this.remainingTime = 0;

            // this.startStopButton.innerHTML = '休憩開始';
            // this.startStopButton.classList.remove('btn-pressed'); // ボタンが押し込まれた状態を解除. 
            // this.running = false;

            this.startStop(); // running == trueなのでelseの方の処理が行われる. 
            // 下記5行と同じ処理を行う. 
            // this.prevRemainingTime = this.remainingTime;
            // clearInterval(this.tInterval);
            // this.startStopButton.innerHTML = '休憩開始';
            // this.startStopButton.classList.remove('btn-pressed'); // ボタンが押し込まれた状態を解除. 
            // this.running = false;

            alert('時間を使い切りました');
        }
        this.displayRemainingTime();
    }  
    
    displayRemainingTime(){ // 残り時間を表示
        let hours = Math.floor(this.remainingTime / (3600*1000));
        hours = (hours < 10) ? `0${hours}` : hours;
        let minutes = Math.floor(this.remainingTime % (3600*1000) / (60*1000));
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
    
        this.display.innerHTML = `
            ${hours}
            <font size="6"> h </font>
            ${minutes}
            <font size="6"> min </font>
        `;
    }
    
    displayTotalRemainingTime(){
        let hours = Math.floor(this.totalRemainingTime / (3600*1000));
        hours = (hours < 10) ? `0${hours}` : hours;
        let minutes = Math.floor(this.totalRemainingTime % (3600*1000) / (60*1000));
        minutes = (minutes <10) ? `0${minutes}` : minutes;
        let seconds = Math.floor(this.totalRemainingTime % (3600*1000) % (60*1000) / 1000);
        seconds = (seconds <10) ? `0${seconds}` : seconds;
    
        this.displayTotal.innerHTML = `
            ${hours}
            <font size="2"> h </font>
            ${minutes}
            <font size="2"> min </font>
        `;
    }

    // this.tm.addBreakTime(this.prevElapsedTime, this.r);
    addBreakTime(sw_prevElapsedTime, sw_r){
        this.remainingTime += Math.floor(sw_r * sw_prevElapsedTime);
        this.displayRemainingTime();

        this.totalRemainingTime += Math.floor(sw_r * sw_prevElapsedTime);
        this.displayTotalRemainingTime();
    }
}

class inputRemainingTime{
    constructor(inputHours, inputMinutes, inputSeconds, tm){
        this.inputHours = inputHours;
        this.inputMinutes = inputMinutes;
        this.inputSeconds = inputSeconds;
        this.tm = tm; // Timerクラスのインスタンス. 
    }
    calcRemainingTime(){
        if(this.tm.running){ // 休憩時間タイマーが作動しているとき. 
            this.tm.startStop(); // 休憩時間タイマーを止める. 
        }
        if(this.inputHours.value < 0 || 
            this.inputMinutes.value < 0 || 
            this.inputSeconds.value < 0){
            alert('すべての値を0以上にしてください');
            this.inputHours.value = 0;
            this.inputMinutes.value = 0;
            this.inputSeconds.value = 0;
        }else{
            this.tm.remainingTime = 
                (Number(this.inputHours.value) * 3600 +
                Number(this.inputMinutes.value) * 60 + 
                Number(this.inputSeconds.value)) * 1000; // 残り時間を先に定義しておく. 
            this.tm.displayRemainingTime();
            this.tm.totalRemainingTime = (Number(this.inputHours.value) * 3600 + Number(this.inputMinutes.value) * 60 + Number(this.inputSeconds.value)) * 1000; // 残り時間を先に定義しておく. 
            this.tm.displayTotalRemainingTime();
        }
    }
}


const tm = new Timer(
    // display, displayTotal, startStopButton
    document.getElementById('tm-display'), 
    document.getElementById('tm-displayTotal'), 
    document.getElementById('tm-startStopButton')
);

const sw = new Stopwatch(
    // display, displayTotal, startStopButton, resetButton, tm, r
    document.getElementById('sw-display'), 
    document.getElementById('sw-displayTotal'), 
    document.getElementById('sw-startStopButton'), 
    document.getElementById('sw-resetButton'),
    tm, 
    document.getElementById('ratio').value
);

tm.sw = sw;

const irt = new inputRemainingTime(
    document.getElementById('initialHours'), 
    document.getElementById('initialMinutes'), 
    document.getElementById('initialSeconds'), 
    // document.getElementById('irt-errorMessage'),
    tm
);

// 最初の休憩時間を反映させる. 
irt.calcRemainingTime(); 

// 「作業開始／中断」ボタンを押したときの処理. 
sw.startStopButton.addEventListener('click', () => sw.startStop());

// 「リセット」ボタンを押したときの処理. 
sw.resetButton.addEventListener('click', () => sw.reset());

// 「休憩開始」ボタンを押したときの処理. 
tm.startStopButton.addEventListener('click', () => tm.startStop());

// 「最初の休憩時間」の「すべて反映」を押したときの処理. 
const timeOutputButton = document.getElementById('timeOutput');
timeOutputButton.addEventListener('click', () => irt.calcRemainingTime());

// 「反映」ボタンを押したときの処理. （作業時間と加算する休憩時間の比率rを反映させる. ）
const ratioButton = document.getElementById('ratioOutput');
ratioButton.addEventListener('click', function() {
    const r = parseFloat(document.getElementById('ratio').value);
    if(r < 0){
        alert('0以上の値を指定してください. ');
    }else{
        sw.r = r;
    }
});





