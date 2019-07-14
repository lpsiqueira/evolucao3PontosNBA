//import * from './graficos/classes.js'

class Main{
    constructor(tag, tag2){
        this.hist = new Histograma(tag)
        this.tabela = new Tabela(tag2)
    }

    assignData(attempts, made, teamShooting) {
        this.attempts = attempts
        this.made = made
        this.teamShooting = teamShooting
    }

    showGraphs(){
        this.hist.atribuiDados(this.attempts)
        this.hist.atribuiDados(this.made)
        this.tabela.atribuiDados(this.teamShooting)
    }
}