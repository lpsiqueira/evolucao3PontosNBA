//import * as d3 from './graficos/d3/d3'
//import * from './main.js'
'use strict';

class ReadData {
    constructor(main){
        this.main = main
    }

    find(vetor, ano) {
        let pos
        for (let i=0; i<vetor.length; i++) {
            if (vetor[i].ano == ano) pos = i;
        }
        return pos
    }
    
    read() {
        let tentativas = [], convertidos = [], infoArremessos = [], teamStats
        this.shooting = infoArremessos
        this.convertidos = convertidos
        this.tentativas = tentativas
        this.tempShooting = []
        this.tempStats = []
        let a, tent, conv

        for(let i=8; i<19; i++) {
            a = i + 1
            tent = 0
            conv = 0
            d3.text(`./dados/20${Math.floor(i/10)-Math.floor((i%10)/10)}${i%10}-20${Math.floor(a/10)-Math.floor((a%10)/10)}${a%10}_team-stats.csv`).then((statsString) => {
                teamStats = d3.csvParseRows(statsString, (d) => {
                    if(d[0]!="" && d[0]!="Rk") {
                        tent += +d[8]
                        conv += +d[7]
                        return {
                            nome: d[1],
                            '3p': +d[7],
                            tent3P: +d[8],
                            tent2P: +d[5]
                        }
                    }                
                })
                tentativas.push({x:2000+i, y:tent})
                convertidos.push({x:2000+i, y:conv})
                this.tempStats.push({ano:2000+i, info:teamStats})
                tent = 0
                conv = 0
            })

            d3.text(`./dados/20${Math.floor(i/10)-Math.floor((i%10)/10)}${i%10}-20${Math.floor(a/10)-Math.floor((a%10)/10)}${a%10}_team-shooting.csv`).then((d) => {
                let shootString = d
                let teamShooting = d3.csvParseRows(shootString, (d) => {
                    if(d[0]!="" && d[0]!="Rk") {
                        return {
                            nome: d[1],
                            '0-3': +d[7],
                            '3-10': +d[8],
                            '10-16': +d[9],
                            '16-3p': +d[10],
                            '3p': +d[11]
                        }
                    }
                })
                infoArremessos.push({ano:2000+i, info:teamShooting})
                if (infoArremessos.length>=11) {

                    let posTempStats = this.find(this.tempStats, 2018)
                    let posInfoArr = this.find(infoArremessos, 2018)

                    for (let i=0; i<30; i++) {
                        //console.log(teamStats)
                        this.tempShooting.push({
                            nome: teamStats[i].nome,
                            legenda: ['0-3 pés', '3-10 pés', '10-16 pés', '16 pés - 3 pontos', '3 pontos'],
                            info: [
                                Math.trunc(infoArremessos[posInfoArr].info[i]['0-3']*this.tempStats[posTempStats].info[i].tent2P),
                                Math.trunc(infoArremessos[posInfoArr].info[i]['3-10']*this.tempStats[posTempStats].info[i].tent2P),
                                Math.trunc(infoArremessos[posInfoArr].info[i]['10-16']*this.tempStats[posTempStats].info[i].tent2P),
                                Math.trunc(infoArremessos[posInfoArr].info[i]['16-3p']*this.tempStats[posTempStats].info[i].tent2P),
                                teamStats[i].tent3P
                            ]
                        })
                    }
                    //console.log(this.tentativas)

                    this.main.assignData(this.tentativas, this.convertidos, this.tempShooting)
                    this.main.showGraphs()
                    //console.log(infoArremessos[10].info)
                    //console.log(teamStats)
                }
            })
        }
    }
}

let read = new ReadData(new Main('grafico', 'tabela'))
read.read()