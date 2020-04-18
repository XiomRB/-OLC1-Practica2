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
                this.mal = this.traducirHTML(tok.lexema.substr(1,tok.lexema.length-2))
                if(!this.mal){
                    this.guardarArchivo("html" +h,".html",this.html)
                    this.guardarArchivo("json"+h,".json",this.json)
                    this.htmlfinal += this.html + "\n"
                    this.jsonfinal += this.json + "\n"
                    h++
                }
                this.mal = false
            }
        });
    }

    crearJSON(h:string){

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
                    else if(cad == "<div>") this.mal = this.div(cadena)
                    else if(cad == "<input") this.mal =  this.input(cadena)
                    else if(cad == "<button") this.mal =  this.button(cadena)
                    else if(cad == "<p") this.mal =  this.p(cadena)
                    else if(cad == "<h1") this.mal = this.h1(cadena)
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
                this.html += "\n</html>\n"
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
            }else if(cadena.substr(this.i,2)=="br" || cadena.substr(this.i,2)=="h1"){
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
                        this.html += "</title>"
                        this.json += "\"\n"
                        this.i += 8
                    }
                }else if(cadena.charAt(this.i) == " " && this.i<cadena.length) this.i++
                else return true
            }
            if(this.i == cadena.length) return true
            else{
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html += this.tabjson + "\n</head>\n"
                this.json += this.tabjson + "}\n"
                this.i += 7
                return false
            }
        }return true
    }

    body(cadena:string){
        if(cadena.charAt(this.i) == ">"){
            this.i++
            this.html += this.tabjson + "<body>\n"
            this.json += this.tabjson + "BODY:{\n"
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
                this.html += this.tabjson + "\n</body>\n"
                this.json += this.tabjson + "}\n"
                this.i+=7
                return false
            }
        }else true
    }

    div(cadena:string){
        if(cadena.charAt(this.i)== ">"){
            this.html +=this.tabjson + "<div>\n"
            this.json += this.tabjson + "DIV:{\n"
            this.i++
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
                        this.json += this.tabjson + "TEXTO: \"" + cad +"\"\n"
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
                    this.json += this.tabjson + "TEXTO: \"" + cad +"\"\n"
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
                        this.json += this.tabjson + "TEXTO:\"" + j +"\"\n"
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
                if(j.length != 0) this.json += this.tabjson + j + "\"\n"
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
                this.json += "\"\n"
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
                this.json += "\"\n"
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
                this.json += "\"\n"
                this.tabjson = this.tabjson.substr(0,this.tabjson.length-5)
                this.html+= "</h1>\n"
                this.json += this.tabjson + "}\n"
                this.i += 5
                return false
            }
        }else return true
    }
} 