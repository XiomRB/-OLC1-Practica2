import { Token, Tipo } from '../token';
import { CATCH_STACK_VAR } from '@angular/compiler/src/output/output_ast';

export class Lexico{
    estado:number = 0;
    token:string ="";
    tokens:Array<Token>;
    errores:Array<Token>;
    constructor(){
        this.tokens = [];
        this.errores = [];
    }
    analizar(texto:string){
        this.limpiar();
        let caracter:string;
        let ctr:number;
        let line:number = 0;
        let col:number = 0;
        texto += "#";
        for (let i = 0; i < texto.length; i++) {
            ctr = texto.charCodeAt(i);
            caracter = texto.charAt(i);
            switch (this.estado) {
                case 0:
                    if(ctr==124){// |
                        this.estado = 1;
                        this.token += caracter;
                    }else if(ctr == 38){ // &
                        this.estado = 2;
                        this.token += caracter;
                    }else if(ctr == 62 || ctr == 60 || ctr == 61 || ctr == 33){// < > ! =
                        this.estado = 3;
                        this.token += caracter;
                    }else if(ctr>47 && ctr<58){//numero
                        this.estado = 5;
                        this.token += caracter;
                    }else if((ctr>64 && ctr<91) || (ctr>96 && ctr<123)){//letra
                        this.estado = 6;
                        this.token += caracter;
                    }else if(ctr == 47){ // /
                        this.estado = 7;
                        this.token += caracter;
                    }else if(ctr == 34){//comillas
                        this.estado = 8;
                        this.token += caracter;
                    }else if(ctr == 39){//comilla
                        this.estado = 9;
                        this.token += caracter;
                    }else if(ctr == 46)this.validar(true,caracter,line,col,Tipo.punto);
                    else if(ctr == 42)this.validar(true,caracter,line,col,Tipo.mult);
                    else if(ctr == 44)this.validar(true,caracter,line,col,Tipo.coma);
                    else if(ctr == 59)this.validar(true,caracter,line,col,Tipo.puntoycoma);
                    else if(ctr == 43)this.validar(true,caracter,line,col,Tipo.suma);
                    else if(ctr == 40)this.validar(true,caracter,line,col,Tipo.parentabre);
                    else if(ctr == 41)this.validar(true,caracter,line,col,Tipo.parentcierra);
                    else if(ctr == 123)this.validar(true,caracter,line,col,Tipo.llaveabre);
                    else if(ctr == 125)this.validar(true,caracter,line,col,Tipo.llavecierra);
                    else if(ctr == 58)this.validar(true,caracter,line,col,Tipo.dospuntos);
                    else if(ctr == 45)this.validar(true,caracter,line,col,Tipo.resta);
                    else if(caracter == "\n"){
                        line++;
                        col = -1;
                    }else if(caracter != "\t" ){
                        if(caracter != "\r"){
                            if(caracter != " "){
                                if(ctr ==35 && i == texto.length-1) this.validar(true,caracter,line,col,Tipo.ultimo);
                                else this.validar(false,caracter,line,col,Tipo.desconocido);//si no ha terminado error
                            }
                        }
                    }
                    break;
                case 1:
                    if(ctr==124)this.validar(true,this.token + caracter,line,col,Tipo.or);
                    else{
                        this.validar(false,this.token,line,col,Tipo.desconocido);
                        i--;
                        col--;
                    }
                    break;
                case 2:
                    if(ctr==38)this.validar(true,this.token + caracter,line,col,Tipo.and);
                    else{
                        this.validar(false,this.token,line,col,Tipo.desconocido);
                        i--;
                        col--;
                    }
                    break;
                case 3:
                    if(ctr==61){
                        if(this.token==">")this.validar(true,this.token + caracter,line,col,Tipo.mayorigual);
                        else if(this.token=="<")this.validar(true,this.token + caracter,line,col,Tipo.menorigual);
                        else if(this.token=="!")this.validar(true,this.token + caracter,line,col,Tipo.distinto);
                        else if(this.token=="=")this.validar(true,this.token + caracter,line,col,Tipo.igual);
                    }else{
                        if(this.token==">")this.validar(true,this.token,line,col,Tipo.mayor);
                        else if(this.token=="<")this.validar(true,this.token,line,col,Tipo.menor);
                        else if(this.token=="!")this.validar(true,this.token,line,col,Tipo.not);
                        else if(this.token=="=")this.validar(true,this.token,line,col,Tipo.asignador);
                        i--;
                        col--;
                    }
                    break;
                case 5:
                    if(ctr>47 && ctr<58)this.token += caracter; //numero
                    else if(ctr == 46){ //punto
                        this.estado = 10;
                        this.token += caracter;
                    }else{
                        this.validar(true,this.token,line,col,Tipo.entero);
                        i--;
                        col--;
                    }
                    break;
                case 6:
                    if((ctr>47 && ctr<58) || (ctr>64 && ctr<91) || (ctr>96 && ctr<123) || ctr == 95) this.token += caracter;
                    else{
                        if(this.token == "string") this.validar(true,this.token,line,col,Tipo.PRstring);
                        else if(this.token == "char") this.validar(true,this.token,line,col,Tipo.PRchar);
                        else if(this.token == "bool")this.validar(true,this.token,line,col,Tipo.PRbool);
                        else if(this.token == "double")this.validar(true,this.token,line,col,Tipo.PRdouble);
                        else if(this.token == "int")this.validar(true,this.token,line,col,Tipo.PRint);
                        else if(this.token == "void")this.validar(true,this.token,line,col,Tipo.PRvoid);
                        else if(this.token == "main")this.validar(true,this.token,line,col,Tipo.PRmain);
                        else if(this.token == "return")this.validar(true,this.token,line,col,Tipo.PRreturn);
                        else if(this.token == "if")this.validar(true,this.token,line,col,Tipo.PRif);
                        else if(this.token == "else")this.validar(true,this.token,line,col,Tipo.PRelse);
                        else if(this.token == "while")this.validar(true,this.token,line,col,Tipo.PRwhile);
                        else if(this.token == "do")this.validar(true,this.token,line,col,Tipo.PRdo);
                        else if(this.token == "for")this.validar(true,this.token,line,col,Tipo.PRfor);
                        else if(this.token == "switch")this.validar(true,this.token,line,col,Tipo.PRswitch);
                        else if(this.token == "Console")this.validar(true,this.token,line,col,Tipo.PRconsole);
                        else if(this.token == "Write")this.validar(true,this.token,line,col,Tipo.PRwrite);
                        else if(this.token == "break")this.validar(true,this.token,line,col,Tipo.PRbreak);
                        else if(this.token == "continue")this.validar(true,this.token,line,col,Tipo.PRcontinue);
                        else if(this.token == "case")this.validar(true,this.token,line,col,Tipo.PRcase);
                        else if(this.token == "default")this.validar(true,this.token,line,col,Tipo.prdefault);
                        else if(this.token == "class")this.validar(true,this.token,line,col,Tipo.PRclass);
                        else if(this.token == "true" || this.token == "false") this.validar(true,this.token,line,col,Tipo.booleano);
                        else this.validar(true,this.token,line,col,Tipo.id);
                        i--;
                        col--;
                    }
                    break;
                case 7:
                    if(ctr == 47){
                        this.estado = 11;
                        this.token += caracter;
                    }else if(ctr == 42){
                        this.estado = 12;
                        this.token += caracter;
                    }else{
                        this.validar(true,this.token,line,col,Tipo.div);
                        i--;
                        col--;
                    }
                    break;
                case 8:
                    if(ctr == 34)this.validar(true,this.token + caracter,line,col,Tipo.cadena);
                    else this.token += caracter;
                    break;
                case 9:
                    if(ctr == 39){
                        if(this.token.length==1 || this.token.length == 2)this.validar(true,this.token + caracter,line,col,Tipo.caracter);
                        else this.validar(true,this.token + caracter,line,col,Tipo.cadHTML);
                    }else this.token += caracter;
                    break;
                case 10:
                    if(ctr>47 && ctr<58){//numero
                        this.estado = 13;
                        this.token += caracter;
                    }else{
                        this.validar(false,this.token,line,col,Tipo.desconocido);
                        i--;
                        col--;
                    }
                    break;
                case 11:
                    if(caracter == "\n" || (caracter == "#" && i == texto.length -1)){
                        this.validar(true,this.token,line,col,Tipo.comentline);
                        i--;
                        col--;
                    }else this.token += caracter;
                    break;
                case 12:
                    if(ctr == 42)this.estado = 14;
                    if(caracter == "\n") line++;
                    this.token += caracter;
                    break;
                case 13:
                    if(ctr>47 && ctr<58) this.token += caracter;
                    else{
                        this.validar(true,this.token,line,col,Tipo.decimal);
                        i--;
                        col--;
                    }
                    break;
                case 14:
                    if(ctr == 47)this.validar(true,this.token + caracter,line,col,Tipo.comentmulti);
                    else if(ctr == 42) this.token += caracter;
                    else{
                        this.estado = 12;
                        this.token += caracter;
                    }
                    break;
            }
            col++;
        }
    }

    validar(v:boolean,lex:string,l:number,c:number,t:Tipo){
        if(v) this.tokens.push(new Token(lex,l,c,t));
        else this.errores.push(new Token(lex,l,c,t));
        this.estado = 0;
        this.token = "";
    }

    limpiar(){
        while (this.tokens.length > 0) this.tokens.pop();   
        while(this.errores.length > 0) this.errores.pop();
    }
}