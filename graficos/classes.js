'use strict';

let cores = ['blue', 'red', 'yellow', 'green', 'black']

let infoGraficoTemplate = {
    dados: undefined,
    cor: undefined,
    titulo: undefined,
    legendaEixoX: undefined,
    legendaEixoY: undefined,
    legenda: undefined
}

class Grafico {
    constructor (tag, altura, largura) {
        this.tag = '#' + tag
        this.tagsemhash = tag

        this.altura = altura
        this.largura = largura
        this.margemVertical = 50
        this.margemHorizontal = 90
        this.margemDireita = this.margemHorizontal + 40

        this.info = Object.assign({}, infoGraficoTemplate)

        this.div = d3.select(this.tag)
        this.svg = this.criaSVG()
        
        this.dados = undefined
        this.maximos = undefined

        this.eixoX = undefined
        this.eixoY = undefined        
    }

    adicionaLegenda(texto) {
        let posY = this.margemVertical+10
        let posX = this.largura-this.margemDireita+10
        let legenda = this.svg.append('g')
            .attr('class', 'legenda');
        legenda.append('text')
            .attr('x', posX)
            .attr('y', posY)
            .text('Legenda:');
        posY+=50;
        for (let i=0; i<this.group.length; i++) {            
            legenda.append('rect')
                .attr('x', posX)
                .attr('y', posY)
                .attr('height', 20)
                .attr('width', 30)
                .attr('fill', cores[i]);
            posY+=40;
            legenda.append('text')
                .attr('x', posX)
                .attr('y', posY)
                .text(texto[i]);
            posY+=30;            
        }
    }

    adicionaLabels(titulo, labelX, labelY) {
        this.info.titulo = this.svg.append('text')
            .attr('transform', `translate(${(this.largura-this.margemHorizontal-this.margemDireita)/2}, ${this.margemVertical-35})`)
            .attr('class', 'titulo')
            .text(titulo)
        this.info.legendaEixoX = this.svg.append('text')
            .attr('transform', `translate(${this.largura-this.margemDireita-100}, ${this.altura-this.margemVertical+40})`)
            .attr('class', 'label')
            .text(labelX)
        this.info.legendaEixoY = this.svg.append('text')
            .attr('transform', `translate(${this.margemHorizontal-40}, ${this.margemVertical+100}) rotate(-90)`)
            .attr('class', 'label')
            .text(labelY)
    }

    criaMargens() {
        this.eixoX = d3.axisBottom().scale(this.scalaX)
        this.eixoY = d3.axisLeft().scale(this.scalaY)
        this.gridX = d3.axisBottom().scale(this.scalaX).ticks()
        this.gridY = d3.axisLeft().scale(this.scalaY).ticks()

        this.svg.append("g")
            .attr("transform", `translate(0, ${this.altura - this.margemVertical})`)
            .attr("class", "grid gridX")
            .call(this.gridX.tickSize(-(this.altura - this.margemVertical*2)).tickFormat(''));
        this.svg.append("g")
            .attr("transform", `translate(${this.margemHorizontal}, 0)`)
            .attr("class", "grid gridY")
            .call(this.gridY.tickSize(-(this.largura - (this.margemDireita + this.margemHorizontal))).tickFormat(''));

        this.svg.append("g")
            .attr('class', 'eixoX')
            .attr("transform", `translate(0, ${this.altura - this.margemVertical})`)
            .call(this.eixoX);
        this.svg.append("g")
            .attr('class', 'eixoY')
            .attr("transform", `translate(${this.margemHorizontal}, 0)`)
            .call(this.eixoY);
    }

    criaSVG() {
        let svg = this.div.append('svg')
        svg.attr('height', this.altura)
            .attr('width', this.largura)
            .attr('class', 'svg')
            .style('style', 'color: black');

        return svg
    }

    valoresMaximos() {
        let xMaximo = this.dados[0][0].x
        let yMaximo = this.dados[0][0].y
        for (let dados of this.dados) {        
            for(let ponto of dados) {
                if (ponto.x > xMaximo) {
                    xMaximo = ponto.x
                }
                if (ponto.y > yMaximo) {
                    yMaximo = ponto.y
                }            
            }
        }
        return {xMax: xMaximo, yMax: yMaximo}
    }

    adicionaBrush() {
        this.brush = this.svg.append('g')
            .attr('class', 'brush')
            .call(d3.brush().on('start brush', this.brushed.bind(this)))
    }

    adicionaZoom() {
        this.zoomY = this.svg.append('rect')
            .attr('width', this.margemHorizontal)
            .attr('height', this.altura)
            .attr('fill', 'transparent')
            .attr('class', 'zoom')
            .call(d3.zoom().on('zoom', this.zoomedY.bind(this)))

        this.zoomX = this.svg.append('rect')
            .attr('y', this.altura - this.margemVertical)
            .attr('width', this.largura)
            .attr('height', this.margemVertical)
            .attr('fill', 'transparent')
            .attr('class', 'zoom')
            .call(d3.zoom().on('zoom', this.zoomedX.bind(this)))
    }
    
}

class Histograma extends Grafico {
    constructor(tag, altura=700, largura=1000) {
        super(tag, altura, largura)
        this.dados = []
        this.group = []
        this.dominio = []
    }

    criaEscala(i) {
        this.maximos = this.valoresMaximos()

        let dom = []
        for(let dados of this.dados) {
            dom = dom.concat(dados)
        }
        //console.log(dom)


        this.dominio = dom.map((el) => el.x)
        //console.log(this.dominio)
        this.scalaX = d3.scaleBand()
            .domain(this.dominio)
            .range([this.margemHorizontal, this.largura - (this.margemDireita)])
            .padding(0.4)
        this.scalaY = d3.scaleLinear()
            .domain([this.maximos.yMax + 50, 0])
            .range([this.margemVertical, this.altura - this.margemVertical])
    }

    preenche() {
        this.svg.selectAll('.hist-dados').remove()
        this.group = []
        let i = 0
        for(let dados of this.dados) {
            this.group.push(this.svg.append('g').attr('class', 'hist-dados'))
            for(let pontos of dados) {
                this.group[i].selectAll('rect').data(dados).enter().append('rect')
                    .attr("x", (d) => this.scalaX(d.x))
                    .attr("y", (d) => this.scalaY(d.y))
                    .attr('height', (d) => this.altura - this.margemVertical - this.scalaY(d.y))
                    .attr('width', (d) => this.scalaX.bandwidth())
                    .attr('fill', cores[i])
                    .attr('data-group', `${i}`)
                    .attr('opacity', 0.5);
            }
            i++
        }
    }

    criaMargens() {
        this.svg.selectAll('.grid').remove()
        this.svg.select('.eixoX').remove()
        this.svg.select('.eixoY').remove()
        super.criaMargens()
    }

    atribuiDados(dados) {
        this.dados.push(dados)
        this.criaEscala(this.dados.length)
        this.criaMargens()
        super.adicionaBrush()
        let svg = document.getElementById(this.tagsemhash).querySelector('.svg')
        this.group.push(d3.select(svg).append('g').attr('class', 'hist-dados'))
        this.preenche()

    }

    brushed() {
        let sel = d3.event.selection
        let i = 0
        for(let dados of this.dados) {
            this.group[i].selectAll('rect')
                .attr('fill', (d, a, b) => {
                    if (this.scalaX(d.x) >= sel[0][0] && this.scalaX(d.x) <= sel[1][0] && this.scalaY(d.y) >= sel[0][1] && this.scalaY(d.y) <= sel[1][1] && 
                            this.scalaX(d.x)+this.scalaX.bandwidth() >= sel[0][0] && this.scalaX(d.x)+this.scalaX.bandwidth() <= sel[1][0] 
                            ||
                        this.scalaX(d.x) >= sel[0][0] && this.scalaX(d.x) <= sel[1][0] && this.scalaY(d.y) <= sel[0][1] && this.scalaY(d.y) <= sel[1][1]) {
                        return 'black'
                    } else {
                        return cores[b[a].attributes['data-group'].value]
                    }
                })
            i++
        }
    }
}

class ScatterPlot extends Grafico {
    constructor(tag, altura=700, largura=1000) {
        super(tag, altura, largura)
        this.dados = []
        this.group = []
    }

    criaEscala() {
        this.maximos = this.valoresMaximos()

        this.scalaX = d3.scaleLinear()
            .domain([0, this.maximos.xMax + 50])
            .range([this.margemHorizontal, this.largura - (this.margemDireita)])
        this.scalaY = d3.scaleLinear()
            .domain([this.maximos.yMax + 50, 0])
            .range([this.margemVertical, this.altura - this.margemVertical])
    }

    atribuiDados(dados) {
        this.dados.push(dados)
        this.criaEscala()
        if (this.dados.length == 1) {
            super.criaMargens()
            super.adicionaBrush()
            super.adicionaZoom()
        }
        let svg = document.getElementById(this.tagsemhash).querySelector('.svg')
        this.group.push(d3.select(svg).append('g'))
        this.preenche()
    }

    preenche() {
        let i = 0
        for(let dados of this.dados) {
            for(let ponto of dados) {
                this.group[i].selectAll('circle').data(dados).enter().append('circle')
                    .attr('cx', (d) => {return this.scalaX(d.x)})
                    .attr('cy', (d) => {return this.scalaY(d.y)})
                    .attr('r', 2.5)
                    .attr('class', 'points')
                    .attr('stroke-width', 0)
                    .attr('fill', cores[i])
                    .attr('data-group', `${this.dados.length-1}`);
            }
            i++
        }
    }

    brushed() {
        let sel = d3.event.selection

        this.svg.selectAll('circle')
            .attr('fill', (d, a, b) => {
                if (this.scalaX(d.x) >= sel[0][0] && this.scalaX(d.x) <= sel[1][0] &&
                    this.scalaY(d.y) >= sel[0][1] && this.scalaY(d.y) <= sel[1][1]) {
                    return 'black'
                } else {
                    return cores[b[a].attributes['data-group'].value]
                }
            })
    }

    zoomedX() {
        let novaScalaX = d3.event.transform.rescaleX(this.scalaX)
        this.eixoX.scale(novaScalaX)
        this.gridX.scale(novaScalaX)
        this.svg.select('.eixoX').call(this.eixoX)
        this.svg.select('.gridX').call(this.gridX)
        this.svg.selectAll('circle')
            .attr('cx', (d) => {return novaScalaX(d.x)})
    }

    zoomedY() {
        let novaScalaY = d3.event.transform.rescaleY(this.scalaY)
        this.eixoY.scale(novaScalaY)
        this.gridY.scale(novaScalaY)
        this.svg.select('.eixoY').call(this.eixoY)
        this.svg.select('.gridY').call(this.gridY)
        this.svg.selectAll('circle')
            .attr('cy', (d) => {return novaScalaY(d.y)})
    }
}

class Serie extends Grafico {
    constructor(tag, altura=700, largura=1000) {
        super(tag, altura, largura)
        this.dados = []
        this.group = []
    }

    criaEscala() {
        this.maximos = this.valoresMaximos()

        this.scalaX = d3.scaleLinear()
            .domain([0, this.maximos.xMax + 50])
            .range([this.margemHorizontal, this.largura - (this.margemDireita)])
        this.scalaY = d3.scaleLinear()
            .domain([this.maximos.yMax + 50, 0])
            .range([this.margemVertical, this.altura - this.margemVertical])
    }

    atribuiDados(dados) {
        this.dados.push(dados)
        this.criaEscala()
        if (this.dados.length == 1) {
            super.criaMargens()
            super.adicionaZoom()
        }
        let svg = document.getElementById(this.tagsemhash).querySelector('.svg')
        this.group.push(d3.select(svg).append('g'))
        this.preenche()
    }

    preenche() {
        let i = 0
        for(let dados of this.dados) {
            this.group[i].selectAll('polyline').data([dados]).enter().append('polyline')
                .attr("points", (d) => {
                    let saida = ''
                    for(let ponto of d) {
                        saida += `${this.scalaX(ponto.x)} ${this.scalaY(ponto.y)}, `
                    }
                    return saida
                })
                .attr('stroke', cores[i])
                .attr('fill', 'transparent')
                .attr('data-group', `${this.dados.length-1}`);
            i++
        }
    }

    /* brushed() {
        let sel = d3.event.selection

        this.svg.selectAll('polyline')
            .attr('stroke', (d, a, b) => {
                if (this.scalaX(d.x) >= sel[0][0] && this.scalaX(d.x) <= sel[1][0] &&
                    this.scalaY(d.y) >= sel[0][1] && this.scalaY(d.y) <= sel[1][1]) {
                    return 'black'
                } else {
                    return cores[b[a].attributes['data-group'].value]
                }
            })
    } */

    zoomedX() {
        let t = d3.event.transform
        let novaEscalaX= t.rescaleX(this.scalaX)
        this.eixoX.scale(novaEscalaX)
        this.gridX.scale(novaEscalaX)
        this.svg.select('.eixoX').call(this.eixoX)
        this.svg.select('.gridX').call(this.gridX)
        this.svg.selectAll('polyline')
            .attr("points", (d) => {
                let saida = ''
                console.log(d)
                for(let ponto of d) {
                    saida += `${novaEscalaX(ponto.x)} ${this.scalaY(ponto.y)}, `
                }
                return saida
            })
    }

    zoomedY() {
        /* let t = d3.event.transform
        let novaScalaY = t.rescaleY(this.scalaY)
        this.eixoY.scale(novaScalaY)
        this.gridY.scale(novaScalaY)
        this.svg.select('.eixoY').call(this.eixoY)
        this.svg.select('.gridY').call(this.gridY)
        this.svg.selectAll('polyline')
            .attr("points", (d) => {
                let saida = ''
                console.log(d)
                for(let ponto of d) {
                    saida += `${this.scalaX(ponto.x)} ${novaScalaY(ponto.y)}, `
                }
                return saida
            }) */
    }
}

class Tabela extends Grafico {
    constructor(tag, altura=1200, largura=1400) {
        super(tag, altura, largura)
        this.margemDireita += 400
        this.dados = []
        this.group = []
        this.dominio = []

        this.colunas = ['0-3', '3-10', '10-16', '16-3p', '3p']
        this.largColuna = 0
    }

    criaEscala() {
        this.scalaX = d3.scaleLinear()
            .domain([this.margemHorizontal, this.largura-this.margemDireita])
            .range([this.margemHorizontal, this.largura-this.margemDireita]);
        this.scalaY = d3.scaleLinear()
            .domain([this.margemVertical, this.altura-this.margemVertical])
            .range([this.margemVertical, this.altura-this.margemVertical]);
    }

    criaDivisoes() {
        this.largColuna = this.scalaX((this.largura-this.margemHorizontal-this.margemDireita)/this.colunas.length)
        this.largLinha = this.scalaY((this.altura-this.margemVertical-this.margemVertical)/30)

        let x = this.margemHorizontal+this.largColuna
        this.posDivsVerticais = [this.scalaX(this.margemHorizontal)]
        for (let i=0; i<this.colunas.length; i++) {
            this.posDivsVerticais.push(this.scalaX(x))
            x += this.largColuna
        }
        let y = this.margemVertical+this.largLinha
        this.posDivsHorizontais = [this.scalaY(this.margemVertical)]
        for (let j=0; j<30; j++) {
            this.posDivsHorizontais.push(this.scalaY(y))
            y += this.largLinha
        }
    }

    preencheDivisoes() {
        let divs = this.svg.append('g')
            .attr('class', 'divisoes');        

        divs.selectAll('line .verticais').data(this.posDivsVerticais).enter().append('line')
            .attr('class', 'verticais')
            .attr('x1', (d) => {return d})
            .attr('y1', this.scalaY(this.margemVertical))
            .attr('x2', (d) => {return d})
            .attr('y2', this.scalaY(this.altura-this.margemVertical))
            .attr('stroke', 'black');
        divs.selectAll('line .horizontais').data(this.posDivsHorizontais).enter().append('line')
            .attr('class', 'horizontais')
            .attr('x1', this.scalaX(this.margemHorizontal))
            .attr('y1', (d) => {return d})
            .attr('x2', this.scalaX(this.largura-this.margemDireita))
            .attr('y2', (d) => {return d})
            .attr('stroke', 'black');
    }

    legendaEixo() {
        let times = [], j = 0
        let g = this.svg.append('g')
            .attr('class', 'legendaeixo');
        for (let dado of this.dados) {
            times.push(dado.nome)
            g.selectAll('text').data(times).enter().append('text')
                .attr('x', this.largura-this.margemDireita+10)
                .attr('y', this.posDivsHorizontais[j]+25)
                .text(dado.nome);

            j++;
        }
        let legendas = []
        legendas = times.concat(this.dados[0].legenda)
        //console.log(legendas)
        let i = -1;
        g.selectAll('text').data(legendas).enter().append('text')
            .attr('x', (d) => {i++; return this.posDivsVerticais[i]+10})
            .attr('y', this.margemVertical-10)
            .text( (d) => {return d} );
    }

    legenda() {
        let group = this.svg.append('g')
        let gradient = group.append('linearGradient')
            .attr('id', 'gradient');
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'white');
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'red');

        let x = this.largura-this.margemDireita+200;
        let y = this.margemVertical+10;
        let altura = this.largLinha;
        let largura = 130;

        group.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', largura)
            .attr('height', this.largLinha)
            .attr('stroke', 'black')
            .attr('fill', 'url(#gradient)');

        group.append('text')
            .attr('x', x)
            .attr('y', y+altura+15)
            .text('0');
        group.append('text')
            .attr('x', x+100)
            .attr('y', y+altura+15)
            .text('3721');
    }

    preenche() {
        let g = this.svg.append('g')
            .attr('class', 'dados');

        //console.log(this.posDivsHorizontais)

        let opacs = [], j = 0
        for (let dado of this.dados) {
            //console.log(dado)
            for(let i=0; i<dado.info.length; i++) {
                opacs.push({opac: dado.info[i]/3721, pos:this.scalaX(this.posDivsVerticais[i])})
            }            
            g.selectAll('rect').data(opacs).enter().append('rect')
                .attr('x', (d) => {return d.pos})
                .attr('y', this.posDivsHorizontais[j])
                .attr('width', this.scalaX(this.largColuna))
                .attr('height', this.scalaY(this.largLinha))
                .attr('fill', (d) => {return `rgb(255,${255-255*d.opac},${255-255*d.opac})`});

            j++;
        }
    }

    atribuiDados(dados) {
        this.dados = dados
        this.criaEscala()
        this.criaDivisoes()
        this.preenche()
        this.preencheDivisoes()
        this.legendaEixo()
    }
}