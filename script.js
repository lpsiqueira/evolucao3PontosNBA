//import * as d3 from './graficos/d3/d3'
'use strict';

let tentativas = [], convertidos = [], infoArremessos = []

let a, tent, conv

for(let i=8; i<19; i++) {
    a = i + 1
    tent = 0
    conv = 0
    d3.csv(`./dados/20${Math.floor(i/10)-Math.floor((i%10)/10)}${i%10}-20${Math.floor(a/10)-Math.floor((a%10)/10)}${a%10}_team-stats.csv`, (d) => {
        if(d["Rk"]!="") {
            tent += +d["3PA"]
            conv += +d["3P"]
        }
        return {
            nome: d.Team,
            '3p': +d["3P"],
            tent3P: +d["3PA"],        
        }
    }).then((d) => {
        //console.log(d)
        tentativas.push({tentativas:tent, ano:2000+i})
        convertidos.push({convertidos:conv, ano:2000+i})
        console.log(tentativas)
        console.log(convertidos)
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
        console.log(infoArremessos)
    })
    //console.log(`20${Math.floor(i/10)-Math.floor((i%10)/10)}${i%10}-20${Math.floor(a/10)-Math.floor((a%10)/10)}${a%10}`)
}

//let teamStats = d3.csv(``)