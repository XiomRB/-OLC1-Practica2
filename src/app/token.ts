import { stringify } from 'querystring';

export class Token{
    lexema:string;
    linea:number;
    columna:number;
    tipo:Tipo;
    constructor(lexema:string,linea:number,columna:number,tipo:Tipo){
        this.lexema = lexema;
        this.linea = linea;
        this.columna = columna;
        this.tipo = tipo;
    }
}
export enum Tipo{
    cadena,decimal,entero,caracter,booleano,cadHTML,
    PRstring,PRdouble,PRint,PRchar,PRbool,
    id,
    PRvoid,PRmain,PRreturn,prdefault,
    PRif, PRelse,PRwhile, PRdo, PRfor, PRswitch,PRconsole,PRwrite,PRbreak,PRcontinue,PRcase,PRclass,
    suma,mult,div,resta,
    and,or,not,
    mayor,menor,mayorigual,menorigual,igual,distinto,
    llaveabre,llavecierra,parentabre,parentcierra,coma,punto,puntoycoma,asignador,dospuntos,
    comentline,comentmulti,desconocido,ultimo
}

export class Variable{
    nombre:string;
    tipo:string;
    line:number;
    constructor(name,t,l){
        this.nombre = name;
        this.tipo = t;
        this.line = l;
    }
}

export class SintaxError{
    descripcion:string;
    linea:number;
    columna:number;

    constructor(desc,line,col){
        this.descripcion = desc;
        this.linea = line;
        this.columna = col;
    }
}