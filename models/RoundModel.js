'use strict' ;

module.exports = class RoundModel {
    constructor(){
        this.roundLabel = null  ;
        this.showdateRoundLabel = null ; 
        this.roundDateTimeLabel = null ; 
        this.roundId = null ;
        this.zoneLayoutWeb = null ; 
        this.maxSelectSeat = null  ;
    }
    
    get _roundLabel(){
        return this.roundLabel  ;
    }
    set _roundLabel( roundLabel ){
        this.roundLabel = roundLabel ;
    }
    
    get _showdateRoundLabel(){
        return this.showdateRoundLabel  ;
    }
    set _showdateRoundLabel( showdateRoundLabel ){
        this.showdateRoundLabel = showdateRoundLabel ;
    }
    
    get _roundDateTimeLabel(){
        return this.roundDateTimeLabel  ;
    }
    set _roundDateTimeLabel( roundDateTimeLabel ){
        this.roundDateTimeLabel = roundDateTimeLabel ;
    }
    
    get _roundId(){
        return this.roundId  ;
    }
    set _roundId( roundId ){
        this.roundId = roundId ;
    }
    
    get _zoneLayoutWeb(){
        return this.zoneLayoutWeb  ;
    }
    set _zoneLayoutWeb( zoneLayoutWeb ){
        this.zoneLayoutWeb = zoneLayoutWeb ;
    }
    
    get _maxSelectSeat(){
        return this.maxSelectSeat  ;
    }
    set _maxSelectSeat( maxSelectSeat ){
        this.maxSelectSeat = maxSelectSeat ;
    }
    
}