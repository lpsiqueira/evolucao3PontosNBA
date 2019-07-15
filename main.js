//import * from './graficos/classes.js'

class Main{
    constructor(tag, tag2){
        this.hist = new Histograma(tag)
        this.tabela = new Tabela(tag2)
    }

    compare(a, b) {
        if (a.ano < b.ano) return -1;
        else return 1;
    }

    assignData(attempts, made, teamShooting) {
        this.attempts = attempts
        this.made = made
        this.teamShooting = teamShooting

        this.attempts.sort(this.compare)
        this.attempts.sort(this.compare)
    }

    showGraphs(){
        this.hist.atribuiDados(this.attempts)
        this.hist.atribuiDados(this.made)
        this.hist.adicionaLegenda(['Tentativas', 'Convertidos'])
        this.hist.adicionaLabels('Arremessos de 3 Pontos', 'temporada', 'totais')
        this.tabela.atribuiDados(this.teamShooting)
        this.tabela.adicionaLabels('Composição dos arremessos de quadra', '', '')
    }
}