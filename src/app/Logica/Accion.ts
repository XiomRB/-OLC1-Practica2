import {Sintactico} from './AnalizadorSintactico'
import { Tipo } from '../token';
import {saveAs} from 'file-saver'

export class Accion{
    sintactico:Sintactico = new Sintactico();
    htmlfinal:string = "";
    jsonfinal:string = ""
    html:string = "";
    json:string = "";
    mal:boolean = false;
    i:number = 0;
    tabjson:string = "";

    crearHTML(){
        this.htmlfinal = "";
        this.jsonfinal = "";
        let h:number = 1;
        this.sintactico.lexico.tokens.forEach(tok => {
            if(tok.tipo==Tipo.cadHTML){
                this.mal = false
                this.mal = this.traducirHTML(tok.lexema.substr(1,tok.lexema.length-2))
                if(!this.mal){
                    this.guardarArchivo("html" +h,".html",this.html)
                    this.guardarArchivo("json"+h,".json",this.json)
                    this.htmlfinal += this.html + "\n"
                    this.jsonfinal += this.json + "\n"
                    h++
                }else{
                    this.htmlfinal += "No se pudo generar el HTML, se encontro un error en la cadena" + h + "\n"
                    this.jsonfinal += "No se pudo generar el JSON, se encontro un error en la cadena" + h + "\n"
                }
            }
        });
    }

    guardarArchivo(name:string,extension:string,cuerpo:string){
        let blob = new Blob([cuerpo]);
        saveAs(blob,name + extension)     
    }

    traducirHTML(cadena:string){
        let cad:string =""
        this.html = ""
        this.json = ""
        this.tabjson = ""
        this.i = 0
        this.mal = false
        while(this.i < cadena.length && !this.mal){
            cad = this.encontrarEtiqueta(cadena)
            if(cad.length!=0){
                if(cad == "<html") this.mal = this.leerHTML(cadena)
                else if(cad == "<br")this.mal = this.br(cadena)
                else if(cad == "<head") this.mal = this.head(cadena)
                else if(cad == "<body") this.mal = this.body(cadena)
                else if(cad == "<div") this.mal = this.div(cadena)
                else if(cad == "<input") this.mal = this.input(cadena)
                else if(cad == "<button") this.mal = this.button(cadena)
                else if(cad == "<p") this.mal = this.p(cadena)
                else if(cad == "<h1") this.mal = this.h1(cadena)
                else if(cad == "<h2") this.mal = this.h2(cadena)
                else if(cad == "<h3") this.mal = this.h3(cadena)
                else if(cad == "<h4") this.mal = this.h4(cadena)
                else if(cad == "<label") this.mal = this.label(cadena)
                else return true
            }else{
                this.i++
                if(cadena.charAt(this.i) == " " && this.i<cadena.length)this.i++
                else return true
            }
        }
        if(this.mal)return true
        return false
    }

    leerHTML(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += "<html>\n"
            this.json += "HTML:{\n"
            this.tabjson += "     "
            this.i++
            console.log(cadena.charAt(this.i))
            while(cadena.substr(this.i,7)!="</html>" && this.i<cadena.length && !this.mal){
                cad = this.encontrarEtiqueta(cadena)
                if(cad == "<title") return true
                else if(cad.length!=0){
                    if(cad == "<br")this.mal = this.br(cadena)
                    else if(cad == "<head") this.mal = this.head(cadena)
                    else if(cad == "<body") this.mal = this.body(cadena)
                    else if(cad == "<div") this.mal = this.div(cadena)
                    else if(cad == "<input") this.mal =  this.input(cadena)
                    else if(cad == "<button") this.mal =  this.button(cadena)
                    else if(cad == "<p") this.mal =  this.p(cadena)
                    else if(cad == "<h1") this.mal = this.h1(cadena)
                    else if(cad == "<h2") this.mal = this.h2(cadena)
                    else if(cad == "<h3") this.mal = this.h3(cadena)
                    else if(cad == "<h4") this.mal = this.h4(cadena)
                    else if(cad == "<label") this.mal = this.label(cadena)
                    else return true
                } else{
                    this.i++
                    if(cadena.charAt(this.i)==" ")this.i++
                    else return true
                } 
            }
            if(this.i >= cadena.length || this.mal) return true
            else{
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html += "</html>\n"
                this.json += "}\n"
                this.i+= 7
                return false
            }
        }else return true
    }
    
    encontrarEtiqueta(cadena:string){
        let cad:string = "";
        if(cadena.charAt(this.i)=="<"){
            cad = "<"
            this.i++
            if(cadena.substr(this.i,4)=="html" || cadena.substr(this.i,4)=="head" || cadena.substr(this.i,4)=="body"){
                cad += cadena.substr(this.i,4)
                this.i+=4
            }else if(cadena.substr(this.i,5)=="title" || cadena.substr(this.i,5)=="label" || cadena.substr(this.i,5)=="input"){
                cad += cadena.substr(this.i,5)
                this.i+=5
            }else if(cadena.substr(this.i,2)=="br" || cadena.substr(this.i,2)=="h1" || cadena.substr(this.i,2)=="h2" || cadena.substr(this.i,2)=="h3" || cadena.substr(this.i,2)=="h4"){
                cad += cadena.substr(this.i,2)
                this.i+=2
            }else if(cadena.charAt(this.i)=="p"){
                cad += cadena.charAt(this.i)
                this.i++
            }else if(cadena.substr(this.i,6)=="button"){
                cad += cadena.substr(this.i,6)
                this.i+=6
            }else if(cadena.substr(this.i,3)=="div"){
                cad += cadena.substr(this.i,3)
                this.i+=3
            }
        }
        return cad;
    }

    head(cadena:string){
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<head>\n"
            this.json += this.tabjson + "HEAD:{\n"
            this.tabjson += "     "
            this.i++
            while(cadena.substr(this.i,7) != "</head>" && this.i < cadena.length){
                if(cadena.substr(this.i,7)=="<title>"){
                    this.i+=7
                    this.html += this.tabjson + "<title>"
                    this.json += this.tabjson + "TITLE: \""
                    while(cadena.substr(this.i,8) != "</title>" && this.i < cadena.length){
                        this.html += cadena.charAt(this.i)
                        this.json += cadena.charAt(this.i)
                        this.i++
                    }
                    if(this.i >= cadena.length) return true
                    else{
                        this.html += "</title>\n"
                        this.json += "\"\n"
                        this.i += 8
                    }
                }else if(cadena.charAt(this.i) == " " && this.i<cadena.length) this.i++
                else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html += this.tabjson + "</head>\n"
                this.json += this.tabjson + "}\n"
                this.i += 7
                return false
            }
        }return true
    }

    etiquetarStyle(cadena:string){
        let cad:string =""
        while(cadena.charAt(this.i)!=">" && this.i < cadena.length){
            if(cadena.substr(this.i,5)=="style"){
                this.i+=5
                if(cadena.charAt(this.i)=="="){
                    this.i++
                    if(cadena.charAt(this.i)=="\""){
                        this.i++
                        if(cadena.substr(this.i,11)=="background:"){
                            this.i += 11
                            if(cadena.substr(this.i,8) == "skyblue\""){
                                this.i += 8
                                cad = " style = \"backgroud:skyblue\"STYLE: \"backgroud: skyblue\",\n"
                            }else if(cadena.substr(this.i,4)=="red\""){
                                this.i += 4
                                cad = " style = \"backgroud:red\"STYLE: \"backgroud: red\",\n"
                            }else if(cadena.substr(this.i,7)=="yellow\""){
                                cad = " style = \"backgroud:yellow\"STYLE: \"backgroud: yellow\",\n"
                                this.i += 7
                            }else if(cadena.substr(this.i,6)=="green\"" || cadena.substr(this.i,6)=="white\""){
                                cad = " style = \"backgroud: " + cadena.substr(this.i,6) +"STYLE: \"backgroud: " +cadena.substr(this.i,6) +",\n"
                                this.i += 6
                            }else if(cadena.substr(this.i,5)=="blue\""){
                                cad = " style = \"backgroud:blue\"STYLE: \"backgroud: blue\",\n"
                                this.i += 5
                            }else return "mal"
                        }else return "mal"
                    }else if(cadena.charAt(this.i)==" ")this.i++
                    else return "mal"
                }else if(cadena.charAt(this.i)==" ")this.i++
                else return "mal"
            }else if(cadena.charAt(this.i)==" ")this.i++
            else return "mal"
        }
        if(this.i < cadena.length){
            if(cadena.charAt(this.i) == ">")return cad
            else return "mal"
        }else return "mal"
    }
    body(cadena:string){
        let estilo:string = this.etiquetarStyle(cadena)
        if(estilo == "mal") return true
        else {
            if(cadena.charAt(this.i) == ">"){
                this.i++
                if(estilo==""){
                    this.html += this.tabjson + "<body>\n"
                    this.json += this.tabjson + "BODY:{\n"
                }else{
                    let s:number = 0;
                    this.html += this.tabjson + "<body "
                    this.json += this.tabjson + "BODY:{\n" + this.tabjson + "     "
                    while(estilo.charAt(s)!="S"){
                        this.html += estilo.charAt(s)
                        s++
                    }
                    while(s < estilo.length){
                        this.json += estilo.charAt(s)
                        s++
                    }
                    this.html += ">\n"
                }
                this.tabjson += "     "
                while(cadena.substr(this.i,7) != "</body>" && this.i < cadena.length && !this.mal){
                    let cad:string = this.encontrarEtiqueta(cadena)
                    if(cad.length!=0){
                        if(cad == "<div") this.mal = this.div(cadena)
                        else if(cad == "<p") this.mal = this.p(cadena)
                        else if(cad == "<input") this.mal = this.input(cadena)
                        else if(cad == "<button") this.mal = this.button(cadena)
                        else if(cad == "<label") this.mal = this.label(cadena)
                        else if(cad == "<h1") this.mal = this.h1(cadena)
                        else if(cad == "<h2") this.mal = this.h2(cadena)
                        else if(cad == "<h3") this.mal = this.h3(cadena)
                        else if(cad == "<h4") this.mal = this.h4(cadena)
                        else return true
                    }else {
                        this.i++
                        if(cadena.charAt(this.i)==" " && this.i< cadena.length)this.i++
                        else return true
                    }
                }
                if(this.mal)return true
                if(this.i == cadena.length)return true
                else{
                    this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                    this.html += this.tabjson + "</body>\n"
                    this.json += this.tabjson + "}\n"
                    this.i+=7
                    return false
                }
            }else true
        }
    }

    div(cadena:string){
        let estilo:string = this.etiquetarStyle(cadena)
        if(estilo == "mal") return true
        else {
        if(cadena.charAt(this.i)== ">"){
            this.i++
            if(estilo==""){
                this.html += this.tabjson + "<div>\n"
                this.json += this.tabjson + "DIV:{\n"
            }else{
                let s:number = 0;
                this.html += this.tabjson + "<div "
                this.json += this.tabjson + "DIV:{\n" + this.tabjson + "     "
                while(estilo.charAt(s)!="S"){
                    this.html += estilo.charAt(s)
                    s++
                }
                while(s < estilo.length){
                    this.json += estilo.charAt(s)
                    s++
                }
                this.html += ">\n"
            }
            this.tabjson += "     "
                while(cadena.substr(this.i,6) != "</div>" && this.i < cadena.length && !this.mal){
                    let cad:string = this.encontrarEtiqueta(cadena)
                    if(cad.length!=0){
                        if(cad == "<div") this.mal = this.div(cadena)
                        else if(cad == "<p") this.mal = this.p(cadena)
                        else if(cad == "<input") this.mal = this.input(cadena)
                        else if(cad == "<button") this.mal = this.button(cadena)
                        else if(cad == "<label") this.mal = this.label(cadena)
                        else if(cad == "<h1") this.mal = this.h1(cadena)
                        else if(cad == "<h2") this.mal = this.h2(cadena)
                        else if(cad == "<h3") this.mal = this.h3(cadena)
                        else if(cad == "<h4") this.mal = this.h4(cadena)
                        else return true
                    }else {
                        this.i++
                        if(cadena.charAt(this.i)==" "&& this.i<cadena.length)  this.i++
                        else return true
                    }
                }
                if(this.mal) return true
                if(this.i == cadena.length) return true
                else{
                    this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                    this.html+= this.tabjson + "</div>\n"
                    this.json += this.tabjson + "}\n"
                    this.i += 6
                    return false
                }
            }else true 
        }
    }

    p(cadena:string){
        if(cadena.charAt(this.i) == ">"){
            this.i++
            this.html += this.tabjson + "<p>"   
            this.json+= this.tabjson + "P:{\n"
            this.tabjson += "     "
            let cad:string = ""
            while(cadena.substr(this.i,4) != "</p>" && this.i < cadena.length){
                if(cadena.substr(this.i,4) == "<br>"){
                    this.html += "<br>"
                    if(cad.length != 0){
                        this.json += this.tabjson + "TEXTO: \"" + cad +"\",\n"
                        cad = ""
                    }
                    this.json += this.tabjson + "BR:{\n" + this.tabjson + "}\n"
                    this.i += 4
                }else{                   
                    this.html += cadena.charAt(this.i);
                    cad += cadena.charAt(this.i)
                    this.i++
                }
            }
            if(this.i == cadena.length)return true
            else{
                if(cad.length!=0){
                    this.json += this.tabjson + "TEXTO: \"" + cad +"\",\n"
                    cad = ""
                }
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</p>\n"
                this.json += this.tabjson + "}\n"
                this.i += 4
                return false
            }
        }else return true
    }

    br(cadena:string){
        if(cadena.charAt(this.i) == ">"){
            this.html += "<br>"
            this.json += this.tabjson + "BR:{\n"+ this.tabjson +"}\n"
            this.i++
            return false
        }else return true
    }

    input(cadena:string){
        let cad:string
        if(cadena.charAt(this.i) == ">"){
            this.html += this.tabjson + "<input>\n"
            this.json += this.tabjson + "INPUT:{\n"
            this.tabjson += "     "
             let j:string = ""
            this.i++
            while(cadena.substr(this.i,8) !="</input>" && this.i<cadena.length && !this.mal){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length>0){
                    if(j.length != 0){
                        this.json += this.tabjson + "TEXTO:\"" + j +"\",\n"
                        j = "TEXTO: \""
                    }
                    if(cad == "<br") this.mal = this.br(cadena)
                    else if(cad == "<p") this.mal = this.p(cadena)
                    else return true
                }else{
                    j += cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }
            }
            if(this.mal) return true
            if(this.i == cadena.length) return true
            else{
                if(j.length != 0) this.json += this.tabjson + j + "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.json += this.tabjson + "}\n"
                this.html += this.tabjson + "</input>\n"
                this.i += 8
                return false
            }
        } else return true
    }

    button(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<button>"
            this.json += this.tabjson + "BUTTON:{\n"
            this.tabjson += "     "
            this.i++
            this.json += this.tabjson + "TEXTO: \""
            while(cadena.substr(this.i,9) != "</button>" && this.i<cadena.length){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length == 0){
                    this.json+= cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.json += "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html += "</button>\n"
                this.json += this.tabjson + "}\n"
                this.i += 9
                return false
            }
        }else return true
    }

    label(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<label>"
            this.json += this.tabjson + "LABEL:{\n"
            this.tabjson += "     "
            this.i++
            this.json += this.tabjson + "TEXTO: \""
            while(cadena.substr(this.i,8) != "</label>" && this.i<cadena.length){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length == 0){
                    this.json+= cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.json += "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</label>\n"
                this.json += this.tabjson + "}\n"
                this.i += 8
                return false
            }
        }else return true
    }

    h1(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<h1>"
            this.json += this.tabjson + "H1:{\n"
            this.tabjson += "     "
            this.i++
            this.json += this.tabjson + "TEXTO: \""
            while(cadena.substr(this.i,5) != "</h1>" && this.i<cadena.length){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length == 0){
                    this.json+= cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.json += "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</h1>\n"
                this.json += this.tabjson + "}\n"
                this.i += 5
                return false
            }
        }else return true
    }

    h2(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<h2>"
            this.json += this.tabjson + "H2:{\n"
            this.tabjson += "     "
            this.i++
            this.json += this.tabjson + "TEXTO: \""
            while(cadena.substr(this.i,5) != "</h2>" && this.i<cadena.length){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length == 0){
                    this.json+= cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.json += "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</h2>\n"
                this.json += this.tabjson + "}\n"
                this.i += 5
                return false
            }
        }else return true
    }

    h3(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<h3>"
            this.json += this.tabjson + "H3:{\n"
            this.tabjson += "     "
            this.i++
            this.json += this.tabjson + "TEXTO: \""
            while(cadena.substr(this.i,5) != "</h3>" && this.i<cadena.length){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length == 0){
                    this.json+= cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.json += "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</h3>\n"
                this.json += this.tabjson + "}\n"
                this.i += 5
                return false
            }
        }else return true
    }

    h4(cadena:string){
        let cad:string = ""
        if(cadena.charAt(this.i)==">"){
            this.html += this.tabjson + "<h4>"
            this.json += this.tabjson + "H4:{\n"
            this.tabjson += "     "
            this.i++
            this.json += this.tabjson + "TEXTO: \""
            while(cadena.substr(this.i,5) != "</h4>" && this.i<cadena.length){
                cad = this.encontrarEtiqueta(cadena)
                if(cad.length == 0){
                    this.json+= cadena.charAt(this.i)
                    this.html += cadena.charAt(this.i)
                    this.i++
                }else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.json += "\",\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</h4>\n"
                this.json += this.tabjson + "}\n"
                this.i += 5
                return false
            }
        }else return true
    }
} 