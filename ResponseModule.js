
'use strict' ;

const RoundModel = require('./models/RoundModel') ;

class ResponseRoundModule {
    
    constructor( eventInfo = {} ){
        this.eventInfo = eventInfo  ;
        this.roundList = [] ;
    }
    
    getResponseRoundList( roundList = [] ) {
        try{
            this.roundList = this.filterRoundList( roundList ) ;
        
            return this.roundList  ;
            
        }catch(e){
            throw e ;
        }
    }
    
    filterRoundList( roundList = [] ){
        let roundModule = {} ;
        return roundList.map( ( round ) => {
            
            roundModule = new RoundModel() ;
            //รหัสรอบ
            roundModule._roundId = round.roundId ;
        
            roundModule._zoneLayoutWeb = round.zoneLayoutWeb;
            //ที่นั่งสูงสุดของรอบ
            roundModule._maxSelectSeat = round.maxSelectSeat;
            
            if( this.eventInfo.performType == 'C' ){
                
                roundModule._roundLabel = round.showdateRoundLabel ;
                roundModule._showdateRoundLabel = round.showdateRoundLabel ; 
                roundModule._roundDateTimeLabel = round.showdateRoundLabel ; 
                
            }else if( this.eventInfo.performType == 'S' && ( this.eventInfo.performSubType == '' || this.eventInfo.performSubType == null )  ){
                
                roundModule._roundLabel = round.showdateRoundLabel  ;
                roundModule._showdateRoundLabel = round.showdateRoundLabel ; 
                roundModule._roundDateTimeLabel = round.showdateRoundLabel ; 
                
            }else if( this.eventInfo.performType == 'S' && this.eventInfo.performSubType == 'FOOTBALL' ){
                
                roundModule._roundLabel = `${round.showdateRoundLabel} | ${round.formatDateText}` ;
                roundModule._showdateRoundLabel = round.showdateRoundLabel ; 
                roundModule._roundDateTimeLabel = round.formatDateText ; 
            }
            return roundModule  ;
            
        }) ;
    }
}

//------------- Export Module Here ----------------------//

exports.ResponseRoundModule = ResponseRoundModule  ;