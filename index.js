"use strict" ;

const   {EventInfoService} = require('allticket-eventinfo-service'),
        {RoundService} = require('allticket-round-service'),
        {MerchandiseService} = require('allticket-merchandise-service'),  
        {ResponseRoundModule} = require('./ResponseModule'),
        axios = require('axios') ,
        ERROR_CODE = "77777" ,
        ERROR_EVENT_IS_NOT_AVAILABLE = "70011" ,
        ERROR_EVENT_NOT_FOUND = "70080" ,
        SUCCESS_CODE = "100" ;       
        require("dotenv").config();

var  { MemcachedModule } = require('atk-memcached');   

const filterDateDiff = ( rounds = [] ) => {
    let list = [] ,
        fsort = (a,b) => a - b ;
    if( rounds.length > 0 ){
        rounds.filter( (round) => {
            if( !list.includes( round.roundDate ) ){
                list.push( Number.parseInt( round.roundDate ));
            }
        });
        list.sort( fsort ) ;
        return list ;
    }
    return list ; 
}

const getDateFromMillisecToString = ( millidate = new Date().getTime() ) => {
    return new Date( new Date(millidate).toLocaleString("th",{timeZone:'Asia/Bangkok'}) ).toISOString() ;
} ;

const doSplitSignFromDateString = ( std ) => {
    let strDate = std.split('T')[0] ;
    return strDate.split('-').join('') ;
};

const doCheckEventInfo = (evtInfo) => {
    if(evtInfo.isfull == 'N' && evtInfo.isfull == 'N'){
        return true  ;
    }
    return false ; 
};

exports.handler =  async (event , callback ) => {
    const done = ( code , message , data = null ) => callback(null, {
        statusCode: '200',
        body: {
                success: ( code == 100 ) ? true : false ,
                code: code ,
                message: message ,
                data:data?data:{}
              },
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
    
    let eparams = {} ,
        response = {} ,
        resp_check_evt = {} ,
        resp_event_info = {} ,
        resp_event_info_run = {},
        resp_run_info = {},
        memcahe_de_key = '' ,
        memcahe_zone_key = '' ,
        memcached_run_key = '',
        memcached_eveninfo_key  = '',
        memcached_round_key = '',
        opts = {} ,
        eventInfoModule = {} ;

    var invokeMemcache = new MemcachedModule(); 

    if( event.body ) {

        eparams =  JSON.parse(JSON.stringify(event.body));       
        memcahe_de_key = `GET_QUOTA_AVA[${eparams.performId}]`;
        memcahe_zone_key = `ZONE_PERFORM[${eparams.performId}]`;
        memcached_run_key = `RUNINFO[${eparams.performId}]`;
        memcached_eveninfo_key = `EVENTINFO[id:${eparams.performId}]`;
        memcached_round_key =  `ROUND[${this.performId}]`;

    }
   
    try{

        eventInfoModule = new EventInfoService(eparams.performId);
        resp_event_info = await eventInfoModule.getEventInfo();
      
        let evt_status = false;
        evt_status = doCheckEventInfo( resp_event_info );     

        if( !evt_status ) {          
            done( ERROR_EVENT_IS_NOT_AVAILABLE , 'Event is not available' , resp_check_evt );
        }
    
        if( resp_event_info != null ) {

            response.event_info = resp_event_info; 

            if( resp_event_info.performSubType && resp_event_info.performSubType == 'NATIONALPARK' ){           
                let resp_date_except = await invokeMemcache.invoke( memcahe_de_key );
                if( resp_date_except == null ) {
                    let strDate = doSplitSignFromDateString( getDateFromMillisecToString( Number.parseInt( resp_event_info.beginReserv ))) ,
                    endDate = doSplitSignFromDateString( getDateFromMillisecToString( Number.parseInt( resp_event_info.endReserv ) )) ; 
                    opts = {
                        method : 'post' , 
                        url : process.env.URL_GET_PERFORM_DATE_EXCEPT ,
                        params : { performId : resp_event_info.id , startDate : strDate , endDate : endDate } ,
                        responseType : 'json' ,
                        headers : {
                            'Content-Type' : 'application/x-www-form-urlencoded'
                        }
                    };
                
                    resp_date_except = await axios( opts );
                
                    response.event_info.date_available = ( resp_date_except.data.data ) ? resp_date_except.data.data : [] ; 
                
                }else {
                    response.event_info.date_available = JSON.parse(resp_date_except.cache_data);
                 
                }
                done( SUCCESS_CODE , 'success' , response);                
         
            }else if( resp_event_info.performSubType && resp_event_info.performSubType == 'RUN' ) {
              
               let resp_run_info = await invokeMemcache.invoke( memcached_run_key );

                if(resp_run_info == null){
                    opts = {
                        method : 'post' , 
                        url : process.env.URL_GET_RUN_INFO ,
                        params : { performId : resp_event_info.id } ,
                        responseType : 'json' ,
                        headers : {
                            'Content-Type' : 'application/x-www-form-urlencoded'
                        }
                    };
                  
                    resp_run_info = await axios( opts );
                    resp_event_info_run = ( resp_run_info.data.data ) ? resp_run_info.data.data : [] ; 
                    resp_event_info_run.maxReserve = resp_event_info.maxReserve  
                    response.event_info.runMaster = resp_event_info_run
                 
                } else {

                    response.event_info.runMaster = JSON.parse(resp_run_info.cache_data) ;
                    response.event_info.runMaster.maxReserve = resp_event_info.maxReserve
                 
                }
                
                done( SUCCESS_CODE , 'Get run success' , response );   
                
            }else if( resp_event_info.performSubType && resp_event_info.performSubType == 'MERCHANDISE' ){               
                let merchandiseService = {} ,
                    merchandise = {} ;

                merchandiseService = new MerchandiseService(eparams.performId);
                merchandise = await merchandiseService.getMerchandiseZone() ;
                response.event_info.performZoneList = merchandise ;
                done( 100 , 'success' , response ) ;                     
            }else {
                let roundModule = {}  , 
                    rounds = [] , 
                    responseRound = {} ;               
                roundModule = new RoundService(eparams.performId);
                rounds = await roundModule.getRoundList() ;
                response.event_info.duration_date = filterDateDiff( rounds ) ;                
                responseRound = new ResponseRoundModule( resp_event_info ) ;
                response.event_info.list_round = responseRound.getResponseRoundList( rounds ) ;
                done( 100 , 'success' , response ) ;
            }
        }else{
            done( ERROR_EVENT_NOT_FOUND , 'Event not found !' , resp_event_info ) ;    
        }      
    }catch(err){
        console.error(err);
        done( ERROR_CODE , err.message , err );
    }
};