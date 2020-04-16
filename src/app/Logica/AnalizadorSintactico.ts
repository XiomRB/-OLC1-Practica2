import {Tipo,Token,SintaxError,Variable} from '../token';
import {Lexico} from './AnalizadorLexico';
import { expressionType } from '@angular/compiler/src/output/output_ast';

export class Sintactico{
    errores:Array<SintaxError> = [];
    cadenas:Array<string> = [];
    lexico:Lexico = new Lexico();
    preanalisis:Token; // guarda el token de la lista
    numpreanalisis:number; //seleccion el token de la lista
    traduccion:string = ""; // ayuda a traducir a python
    mtd:string=""; //verifica si es un metodo o una funcion
    variables:Array<Variable> =[]; //guarda las variables creadas
    vrb:string = ""; //variable
    tab:string = ""; //ayuda a tabular la traduccion a python
    swtc:boolean = false; //verifica si hay una sentencia switch para unir y no hacer tabs

    limpiar(){
        while(this.cadenas.length!=0) this.cadenas.pop()
        while(this.errores.length!=0) this.errores.pop()
        while(this.variables.length!=0) this.variables.pop()
    }
    parser(texto:string){
        this.lexico.analizar(texto);
        if(this.lexico.tokens.length != 0){
            this.preanalisis = this.lexico.tokens[0];
            this.numpreanalisis = 0;
            this.clases();
            //while(this.numpreanalisis != this.lexico.tokens.length-1)this.sentencia();
        }
    }

    coment(){
        let coment:string = this.preanalisis.lexema;
        switch (this.preanalisis.tipo) {
            case Tipo.comentline:
                this.cadenas.push(this.tab + "#" + coment.substr(2));
                this.match(Tipo.comentline);
                break;
            case Tipo.comentmulti:
                this.cadenas.push( this.tab +"'''" + coment.substr(2,coment.length-4) + "'''")
                this.match(Tipo.comentmulti);
                break;
            default:
                let desc:string = "Se esperaba un comentario ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    tipado(){
        this.vrb = this.preanalisis.lexema;
        switch (this.preanalisis.tipo) {
            case Tipo.PRstring:
                this.match(Tipo.PRstring);
                break;
            case Tipo.PRbool:
                this.match(Tipo.PRbool);
                break;
            case Tipo.PRint:
                this.match(Tipo.PRint);
                break;
            case Tipo.PRchar:
                this.match(Tipo.PRchar);
                break;
            case Tipo.PRdouble:
                this.match(Tipo.PRdouble);
                break;
            default:
                let desc:string = "Se esperaba un tipo de dato ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
        this.traduccion += "var ";
    }

    listaid(){
        switch (this.preanalisis.tipo) {
            case Tipo.coma:
                this.match(Tipo.coma);
                this.traduccion += ", " + this.preanalisis.lexema;
                this.variables.push(new Variable(this.preanalisis.lexema,this.vrb,this.preanalisis.linea));
                this.match(Tipo.id);
                this.listaid()
                break;
        }
    }

    declaracion(){
        this.tipado();
        this.traduccion += this.preanalisis.lexema;
        this.variables.push(new Variable(this.preanalisis.lexema,this.vrb,this.preanalisis.linea));
        this.match(Tipo.id);
        this.funcion();
    }

    asignaciondec(){
        switch (this.preanalisis.tipo) {
            case Tipo.asignador:
                this.traduccion+= " = ";
                this.match(Tipo.asignador)
                this.expresion();
                this.match(Tipo.puntoycoma)
                break;
            case Tipo.puntoycoma:
                this.match(Tipo.puntoycoma)
                break;
            default:
                let desc:string = "Se esperaba un ; ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
        this.cadenas.push(this.tab + this.traduccion);
        this.traduccion = "";
    }

    exp(){
        this.traduccion += this.preanalisis.lexema;
        switch (this.preanalisis.tipo) {
            case Tipo.not:
                this.match(Tipo.not);
                this.exp();
            case Tipo.cadena:
                this.match(Tipo.cadena)
                break;
            case Tipo.id:
                this.match(Tipo.id);
                this.llamada();
                break;
            case Tipo.caracter:
                this.match(Tipo.caracter)
                break;
            case Tipo.decimal:
                this.match(Tipo.decimal)
                break;
            case Tipo.entero:
                this.match(Tipo.entero)
                break;
            case Tipo.booleano:
                this.match(Tipo.booleano)
                break;
            case Tipo.parentabre:
                this.match(Tipo.parentabre);
                this.expresion();
                this.traduccion += ")"
                this.match(Tipo.parentcierra);
                break;
            default:
                let desc:string = "Se esperaba un dato ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    opexp(){
        switch (this.preanalisis.tipo) {
            case Tipo.suma:
                this.traduccion += " + ";
                this.match(Tipo.suma);
                this.exp()
                this.opexp()
                break;
            case Tipo.resta:
                this.traduccion += " - ";
                this.match(Tipo.resta);
                this.exp()
                this.opexp()
                break;
            case Tipo.mult:
                this.traduccion += " * ";
                this.match(Tipo.mult);
                this.exp()
                this.opexp()
                break;
            case Tipo.div:
                this.traduccion += " / ";
                this.match(Tipo.div);
                this.exp()
                this.opexp()
                break;
            case Tipo.or:
                this.traduccion += " || ";
                this.match(Tipo.or);
                this.exp()
                this.opexp()
                break;
            case Tipo.and:
                this.traduccion += " && ";
                this.match(Tipo.and);
                this.exp()
                this.opexp()
                break;
            case Tipo.distinto:
                this.traduccion += " != ";
                this.match(Tipo.distinto);
                this.exp()
                this.opexp()
                break;
            case Tipo.igual:
                this.traduccion += " == ";
                this.match(Tipo.igual);
                this.exp()
                this.opexp()
                break;
            case Tipo.mayorigual:
                this.traduccion += " >= ";
                this.match(Tipo.mayorigual);
                this.exp()
                this.opexp()
                break;
            case Tipo.menorigual:
                this.traduccion += " <= ";
                this.match(Tipo.menorigual);
                this.exp()
                this.opexp()
                break;
            case Tipo.mayor:
                this.traduccion += " > ";
                this.match(Tipo.mayor);
                this.exp()
                this.opexp()
                break;
            case Tipo.menor:
                this.traduccion += " < ";
                this.match(Tipo.menor);
                this.exp()
                this.opexp()
                break;
        }
    }

    expresion(){
        this.exp();
        this.opexp();
    }

    llamada(){
        if (this.preanalisis.tipo==Tipo.parentabre) {
            this.traduccion += "(";
            this.match(Tipo.parentabre);
            this.param();
            this.match(Tipo.parentcierra);
            this.traduccion += ")";
        }
    }

    param(){
        switch (this.preanalisis.tipo) {
            case Tipo.cadena:
            case Tipo.id:
            case Tipo.caracter:
            case Tipo.decimal:
            case Tipo.entero:
            case Tipo.booleano:
            case Tipo.parentabre:
                this.expresion();
                this.listaparam();
                break;
        }
    }

    listaparam(){
        switch (this.preanalisis.tipo) {
            case Tipo.coma:
                this.traduccion += ", ";
                this.match(Tipo.coma)
                this.expresion();
                this.listaparam();
                break;
        }
    }

    parametros(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRstring:
            case Tipo.PRbool:
            case Tipo.PRint:
            case Tipo.PRdouble:
            case Tipo.PRchar:
                this.tipado();
                this.traduccion = this.traduccion.substr(0,this.traduccion.length-4);
                this.traduccion += this.preanalisis.lexema;
                this.match(Tipo.id);
                this.traduccion += this.listap();

                break;
        }
    }

    listap(){
        let t:string = "";
        switch (this.preanalisis.tipo) {
            case Tipo.coma:
                t += ", ";
                this.match(Tipo.coma);
                this.tipado();
                t += this.preanalisis.lexema;
                this.match(Tipo.id);
                t += this.listap();
                break;
        }
        return t;
    }

    metodo(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRvoid:
                this.traduccion += "void ";
                this.mtd = "metodo";
                this.match(Tipo.PRvoid);
                this.main();
                this.mtd = "";
                break;
            default:
                let desc:string = "Se esperaba " + this.getTipo(Tipo.PRvoid) + " ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    main(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRmain:
                this.cadenas.push(this.tab + this.traduccion + "main():");
                this.traduccion = "";
                this.match(Tipo.PRmain);
                this.match(Tipo.parentabre);
                this.match(Tipo.parentcierra);
                this.match(Tipo.llaveabre);
                this.tab += "     ";
                this.sentencias();
                this.returnmet();
                this.tab = this.tab.substr(0,this.tab.length-5)
                this.match(Tipo.llavecierra);
                break;
            case Tipo.id:
                this.traduccion += this.preanalisis.lexema + "(";
                this.match(Tipo.id);
                this.match(Tipo.parentabre);
                this.parametros();
                this.cadenas.push(this.traduccion + "):")
                this.traduccion = "";
                this.match(Tipo.parentcierra);
                this.match(Tipo.llaveabre);
                this.tab += "     ";
                this.sentencias();
                this.returnmet();
                this.tab = this.tab.substr(0,this.tab.length-5)
                this.match(Tipo.llavecierra);
                break;
            default:
                let desc:string = "Se esperaba un " + this.getTipo(Tipo.id) + " ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    returnmet(){
        if(this.preanalisis.tipo == Tipo.PRreturn){
            this.match(Tipo.PRreturn);
            this.match(Tipo.puntoycoma);
            this.cadenas.push(this.tab + "return");
        }
    }

    funcion(){
        let t:string = this.traduccion;
        switch (this.preanalisis.tipo) {
            case Tipo.parentabre:
                this.variables.pop();
                this.mtd = "funcion";
                this.traduccion = "def " + t.substr(4) + "(";
                this.match(Tipo.parentabre);
                this.parametros();
                this.cadenas.push(this.tab + this.traduccion + "):");
                this.traduccion = "";
                this.match(Tipo.parentcierra);
                this.match(Tipo.llaveabre);
                this.tab += "     ";
                this.sentencias();
                this.match(Tipo.PRreturn);
                this.traduccion += this.tab + "return ";
                this.expresion();
                this.match(Tipo.puntoycoma);
                this.tab = this.tab.substr(0,this.tab.length-5);
                this.cadenas.push(this.traduccion);
                this.traduccion = "";
                this.match(Tipo.llavecierra);
                this.mtd = "";
                break;
            default:
                this.listaid();
                this.asignaciondec();
                break;
        }
        
    }

    ret(){
        if(this.mtd == "funcion"){
            switch (this.preanalisis.tipo) {
                case Tipo.PRreturn:
                    this.match(Tipo.PRreturn);
                    if(this.swtc)this.traduccion += "return"
                    else this.traduccion += this.tab + "return ";
                    this.expresion();
                    this.match(Tipo.puntoycoma);
                    if(!this.swtc){
                        this.cadenas.push(this.traduccion);
                        this.traduccion = "";
                    } 
                    this.ret();
                    break;
                default:
                    this.sentencias();
                    break;
            }
        }else if(this.mtd == "metodo"){
            switch (this.preanalisis.tipo) {
                case Tipo.PRreturn:
                    this.returnmet();
                    this.ret();
                    break;
                default:
                    this.sentencias();
                    break;
            }
        }
    }

    sentif(){
        this.match(Tipo.PRif);
        this.match(Tipo.parentabre);
        this.traduccion += this.tab + "if ";
        this.expresion();
        this.match(Tipo.parentcierra);
        this.match(Tipo.llaveabre);
        this.cadenas.push(this.traduccion + ":");
        this.traduccion = "";
        this.tab += "     ";
        this.ret();
        this.tab = this.tab.substr(0,this.tab.length-5)
        this.match(Tipo.llavecierra);
        this.sentelse();
    }

    sentelse(){
        if(this.preanalisis.tipo == Tipo.PRelse){
            this.match(Tipo.PRelse);
            this.elseif();
            this.sentelse();
        }
    }

    elseif(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRif:
                this.match(Tipo.PRif);
                this.match(Tipo.parentabre);
                this.traduccion += this.tab + "elif ";
                this.expresion();
                this.match(Tipo.parentcierra);
                this.match(Tipo.llaveabre);
                this.cadenas.push(this.traduccion + ":");
                this.traduccion = "";
                this.tab += "     "
                this.ret();
                this.tab = this.tab.substr(0,this.tab.length-5)
                this.match(Tipo.llavecierra);
                break;
            case Tipo.llaveabre:
                this.cadenas.push( this.tab + "else:")
                this.match(Tipo.llaveabre);
                this.tab += "     "
                this.ret();
                this.tab = this.tab.substr(0,this.tab.length-5)
                this.match(Tipo.llavecierra);
                break;
            default:
                let desc:string = "Se esperaba " + this.getTipo(Tipo.llaveabre) + " ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    sentswitch(){
        this.match(Tipo.PRswitch);
        this.match(Tipo.parentabre);
        this.traduccion += this.tab + "def switch(case,";
        this.expresion();
        this.match(Tipo.parentcierra);
        this.match(Tipo.llaveabre);
        this.cadenas.push(this.traduccion + "):");
        this.traduccion = "";
        this.tab += "     "
        this.cadenas.push( this.tab +"switcher={");
        this.match(Tipo.PRcase);
        this.tab += "     "
        this.traduccion += this.tab;
        this.exp();
        this.traduccion += ":"
        this.match(Tipo.dospuntos);
        this.swtc = true
        this.ret();
        this.sentbreak();
        this.traduccion +=",";
        this.cadenas.push(this.traduccion);
        this.traduccion = "";
        this.listacase();
        this.defaultswitch();
        this.tab = this.tab.substr(0,this.tab.length-5)
        this.cadenas.push(this.tab + "}")
        this.tab = this.tab.substr(0,this.tab.length-5)
        this.match(Tipo.llavecierra);
        this.swtc = false;
    }

    listacase(){
        if(this.preanalisis.tipo == Tipo.PRcase){
            this.match(Tipo.PRcase);
            this.traduccion += this.tab
            this.exp();
            this.match(Tipo.dospuntos);
            this.traduccion += ":"
            this.ret();
            this.sentbreak();
            this.traduccion += ","
            this.cadenas.push(this.traduccion);
            this.traduccion = "";
            this.listacase();
        }
    }

    defaultswitch(){
        if(this.preanalisis.tipo == Tipo.prdefault){
            this.match(Tipo.prdefault);
            this.match(Tipo.dospuntos);
            this.traduccion += this.tab + "ult:"
            this.ret();
            this.sentbreak();
            this.cadenas.push(this.traduccion + ",");
            this.traduccion = ""
        }
    }

    sentbreak(){
        if(this.preanalisis.tipo == Tipo.PRbreak){
            this.match(Tipo.PRbreak);
            this.match(Tipo.puntoycoma);
            if(!this.swtc)this.traduccion = "break";
        }
    }

    sentfor(){
        this.match(Tipo.PRfor);
        this.match(Tipo.parentabre);
        this.match(Tipo.PRint);
        this.traduccion += this.tab + "for " + this.preanalisis.lexema + " in range(";
        this.match(Tipo.id);
        this.match(Tipo.asignador);
        this.expresion();
        this.match(Tipo.puntoycoma);
        this.match(Tipo.id);
        this.relacional();
        this.traduccion +=","
        this.expresion();
        this.match(Tipo.puntoycoma);
        this.match(Tipo.id);
        this.op();
        this.match(Tipo.parentcierra);
        this.match(Tipo.llaveabre);
        this.cadenas.push(this.traduccion + "):");
        this.traduccion = "";
        this.tab += "     "
        this.repeticion();
        this.tab = this.tab.substr(0,this.tab.length-5)
        this.match(Tipo.llavecierra);
    }

    op(){
        switch (this.preanalisis.tipo) {
            case Tipo.suma:
                this.match(Tipo.suma);
                this.match(Tipo.suma);
                break;
            case Tipo.resta:
                this.match(Tipo.resta);
                this.match(Tipo.resta);
            default:
                let desc:string = "Se esperaba ++ o -- ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    relacional(){
        switch (this.preanalisis.tipo) {
            case Tipo.mayor:
                this.match(Tipo.mayor)
                break;
            case Tipo.mayorigual:
                this.match(Tipo.mayorigual)
                break;
            case Tipo.menor:
                this.match(Tipo.menor)
                break;
            case Tipo.menorigual:
                this.match(Tipo.menorigual)
                break;
            case Tipo.igual:
                this.match(Tipo.igual)
                break;
            case Tipo.distinto:
                this.match(Tipo.distinto)
                break;
            default:
                let desc:string = "Se esperaba operador de relacion ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    sentwhile(){
        this.match(Tipo.PRwhile);
        this.match(Tipo.parentabre);
        this.traduccion += this.tab + "while(";
        this.expresion();
        this.cadenas.push(this.traduccion + "):");
        this.traduccion = "";
        this.match(Tipo.parentcierra);
        this.match(Tipo.llaveabre);
        this.tab += "     "
        this.repeticion();
        this.tab = this.tab.substr(0,this.tab.length-5)
        this.match(Tipo.llavecierra);
    }

    dowhile(){
        this.match(Tipo.PRdo);
        this.match(Tipo.llaveabre);
        this.cadenas.push( this.tab +"while(True):");
        this.tab += "     "
        this.repeticion();
        this.match(Tipo.llavecierra);
        this.match(Tipo.PRwhile);
        this.match(Tipo.parentabre);
        this.traduccion += this.tab + "if "
        this.expresion();
        this.cadenas.push(this.traduccion + ":\n" + this.tab + "     break");
        this.traduccion = "";
        this.tab.substr(0,this.tab.length-5)
        this.match(Tipo.parentcierra);
        this.match(Tipo.puntoycoma);
    }

    imprimir(){
        this.match(Tipo.PRconsole);
        this.match(Tipo.punto);
        this.match(Tipo.PRwrite);
        this.match(Tipo.parentabre);
        this.traduccion +=this.tab + "print(";
        this.texto();
        this.cadenas.push(this.traduccion + ")");
        this.traduccion = "";
        this.match(Tipo.parentcierra);
        this.match(Tipo.puntoycoma);
    }

    texto(){
        switch (this.preanalisis.tipo) {
            case Tipo.cadHTML:
                this.traduccion += this.preanalisis.lexema;
                this.match(Tipo.cadHTML);
                break;
            default:
                this.expresion();
                break;
        }
    }

    repeticion(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRreturn:
                this.ret()
                break
            case Tipo.PRcontinue:
                this.match(Tipo.PRcontinue);
                this.match(Tipo.puntoycoma);
                this.cadenas.push("continue");
                this.repeticion();
                break;
            case Tipo.PRbreak:
                this.match(Tipo.PRbreak);
                this.match(Tipo.puntoycoma);
                this.cadenas.push("break");
                this.repeticion();
                break;
            case Tipo.PRdo:
            case Tipo.PRwhile:
            case Tipo.PRfor:
            case Tipo.PRswitch:
            case Tipo.PRif:
            case Tipo.PRvoid:
            case Tipo.id:
            case Tipo.PRconsole:
            case Tipo.comentmulti:
            case Tipo.comentline:
            case Tipo.PRstring:
            case Tipo.PRbool:
            case Tipo.PRint:
            case Tipo.PRdouble:
            case Tipo.PRchar:
                this.sentencia();
                this.repeticion();
                break;
        }
    }

    sentencia(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRdo:
                this.dowhile();
                break;
            case Tipo.PRwhile:
                this.sentwhile();
                break;
            case Tipo.PRfor:
                this.sentfor();
                break;
            case Tipo.PRswitch:
                this.sentswitch();
                break;
            case Tipo.PRif:
                this.sentif();
                break;
            case Tipo.PRvoid:
                this.metodo();
                break;
            case Tipo.id:
                this.asignacion();
                break;
            case Tipo.PRconsole:
                this.imprimir();
                break;
            case Tipo.comentmulti:
            case Tipo.comentline:
                this.coment();
                break;
            case Tipo.PRstring:
            case Tipo.PRbool:
            case Tipo.PRint:
            case Tipo.PRdouble:
            case Tipo.PRchar:
                this.declaracion();
                break;
            default:
                let desc:string = "Se esperaba una sentencia ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                this.numpreanalisis += 1;
                this.preanalisis = this.lexico.tokens[this.numpreanalisis];
                break;
        }
    }

    sentencias(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRdo:
            case Tipo.PRwhile:
            case Tipo.PRfor:
            case Tipo.PRswitch:
            case Tipo.PRif:
            case Tipo.PRvoid:
            case Tipo.id:
            case Tipo.PRconsole:
            case Tipo.comentmulti:
            case Tipo.comentline:
            case Tipo.PRstring:
            case Tipo.PRbool:
            case Tipo.PRint:
            case Tipo.PRdouble:
            case Tipo.PRchar:
                this.sentencia();
                this.sentencias();
        }
    }

    asignacion(){
        if(this.swtc) this.traduccion += this.preanalisis.lexema
        else this.traduccion += this.tab + this.preanalisis.lexema;
        this.match(Tipo.id);
        this.asigna();
        if(!this.swtc){
            this.cadenas.push(this.traduccion);
            this.traduccion = "";
        }
        this.match(Tipo.puntoycoma);
    }

    asigna(){
        switch (this.preanalisis.tipo) {
            case Tipo.suma:
                this.traduccion += " +";
                this.match(Tipo.suma);
                this.mas();
                break;
            case Tipo.resta:
                this.traduccion +=" -";
                this.match(Tipo.resta);
                this.menos();
                break;
            case Tipo.mult:
                this.traduccion += " *= ";
                this.match(Tipo.mult);
                this.match(Tipo.asignador);
                this.expresion();
                break;
            case Tipo.div:
                this.traduccion += " /= ";
                this.match(Tipo.div);
                this.match(Tipo.asignador);
                this.expresion();
                break;
            case Tipo.asignador:
                this.traduccion += " = "
                this.match(Tipo.asignador);
                this.expresion();
                break;
            case Tipo.parentabre:
                this.traduccion += "("
                this.match(Tipo.parentabre);
                this.param();
                this.traduccion += ")";
                this.match(Tipo.parentcierra);
        }
    }

    mas(){
        switch (this.preanalisis.tipo) {
            case Tipo.suma:
                this.traduccion += "+";
                this.match(Tipo.suma);
                break;
            case Tipo.asignador:
                this.traduccion += "= ";
                this.match(Tipo.asignador);
                this.expresion();
            default:
                let desc:string = "Se esperaba una asignacion ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    menos(){
        switch (this.preanalisis.tipo) {
            case Tipo.resta:
                this.traduccion += "-";
                this.match(Tipo.resta);
                break;
            case Tipo.asignador:
                this.traduccion += "= ";
                this.match(Tipo.asignador);
                this.expresion();
            default:
                let desc:string = "Se esperaba una asignacion ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                break;
        }
    }

    clase(){
        this.match(Tipo.PRclass);
        this.cadenas.push("class " + this.preanalisis.lexema + ":");
        this.match(Tipo.id)
        this.match(Tipo.llaveabre)
        this.tab += "     "
        this.sentsclase()
        this.tab = this.tab.substr(0,this.tab.length-5)
        this.match(Tipo.llavecierra)
    }

    clases(){
        if(this.preanalisis.tipo == Tipo.PRclass){
            this.clase();
            this.clases();
        }
        else if(this.preanalisis.tipo == Tipo.comentmulti || this.preanalisis.tipo == Tipo.comentline) {
            this.coment();
            this.clases();
        }else if(this.numpreanalisis != this.lexico.tokens.length-1){
            let desc:string = "Se esperaba " + this.getTipo(Tipo.PRclass) + " ... Se encontro " + this.getTipo(this.preanalisis.tipo);
            this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
            this.numpreanalisis++;
            this.preanalisis = this.lexico.tokens[this.numpreanalisis];
            this.clases();
        }
    }
    sentclase(){
        switch (this.preanalisis.tipo) {
            case Tipo.PRvoid:
                this.metodo();
                break;
            case Tipo.comentmulti:
            case Tipo.comentline:
                this.coment();
                break;
            case Tipo.PRstring:
            case Tipo.PRbool:
            case Tipo.PRint:
            case Tipo.PRdouble:
            case Tipo.PRchar:
                this.declaracion();
                break;
            default:
                let desc:string = "Se esperaba un } ... Se encontro " + this.getTipo(this.preanalisis.tipo);
                this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna));
                this.numpreanalisis += 1;
                this.preanalisis = this.lexico.tokens[this.numpreanalisis];
                break;
        }
    }

    sentsclase(){
        if(this.preanalisis.tipo != Tipo.llavecierra && this.numpreanalisis != this.lexico.tokens.length - 1){
            this.sentclase()
            this.sentsclase();
        }
    }

    match(tipo:Tipo){
        if(tipo != this.preanalisis.tipo){
            let desc:string = "Se esperaba: " + this.getTipo(tipo) + " ... Se encontro " + this.getTipo(this.preanalisis.tipo);
            this.errores.push(new SintaxError(desc,this.preanalisis.linea,this.preanalisis.columna))
        }else{
            if(this.preanalisis.tipo != Tipo.ultimo){
                this.numpreanalisis ++;
                this.preanalisis = this.lexico.tokens[this.numpreanalisis];
            }
        }
    }

    getTipo(tipo:Tipo){
        switch (tipo) {
            case Tipo.PRclass:
                return "Palabra reservada class"
            case Tipo.PRbool:
                return "Palabra reservada bool";
            case Tipo.PRbreak:
                return "Palabra reservada break"
            case Tipo.PRcase:
                return "Palabra reservada case";
            case Tipo.PRchar:
                return "Palabra reservada char";
            case Tipo.PRconsole:
                return "Palabra reservada Console"
            case Tipo.PRcontinue:
                return "Palabra reservada continue";
            case Tipo.prdefault:
                return "Palabra reservada default"
            case Tipo.PRdo:
                return "Palabra reservada do"
            case Tipo.PRdouble:
                return "Palabra reservada double";
            case Tipo.PRelse:
                return "Palabra reservada else"
            case Tipo.PRfor:
                return "Palabra reservada for";
            case Tipo.PRif:
                return "Palabra reservada if"
            case Tipo.PRint:
                return "Palabra reservada int";
            case Tipo.PRmain:
                return "Palabra reservada main"
            case Tipo.PRreturn:
                return "Palabra reservada return";
            case Tipo.PRstring:
                return "Palabra reservada string"
            case Tipo.PRswitch:
                return "Palabra reservada switch";
            case Tipo.PRvoid:
                return "Palabra reservada void"
            case Tipo.PRwhile:
                return "Palabra reservada while";
            case Tipo.PRwrite:
                return "Palabra reservada Write";
            case Tipo.and:
                return "&&";
            case Tipo.asignador:
                return "=";
            case Tipo.booleano:
                return "Palabras reservadas true  o false";
            case Tipo.cadHTML:
                return "cadena"
            case Tipo.cadena:
                return "cadena";
            case Tipo.caracter:
                return "caracter";
            case Tipo.coma:
                return "coma";
            case Tipo.comentline:
                return "linecoment"
            case Tipo.comentmulti:
                return "multicoment";
            case Tipo.decimal:
                return "decimal"
            case Tipo.distinto:
                return "!=";
            case Tipo.div:
                return "/"
            case Tipo.dospuntos:
                return ":";
            case Tipo.entero:
                return "entero"
            case Tipo.id:
                return "id";
            case Tipo.igual:
                return "="
            case Tipo.llaveabre:
                return "{";
            case Tipo.llavecierra:
                return "}"
            case Tipo.mayor:
                return ">";
            case Tipo.mayorigual:
                return ">="
            case Tipo.menor:
                return "<";
            case Tipo.menorigual:
                return "<="
            case Tipo.mult:
                return "*";
            case Tipo.not:
                return "!"
            case Tipo.or:
                return "||";
            case Tipo.parentabre:
                return "("
            case Tipo.parentcierra:
                return ")";
            case Tipo.punto:
                return "."
            case Tipo.puntoycoma:
                return ";";
            case Tipo.resta:
                return "-"
            case Tipo.suma:
                return "+";
        }
    }
}
