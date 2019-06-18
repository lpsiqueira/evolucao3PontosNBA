//import * from './graficos/classes.js'

class Main{
    constructor(tag){
        this.hist = new Histograma(tag)
    }

    assignData(attempts, made, teamShooting) {
        this.attempts = attempts
        this.made = made
        this.teamShooting = teamShooting
    }

    showGraphs(){
        this.hist.atribuiDados(this.attempts)
        this.hist.atribuiDados(this.made)
    }
}