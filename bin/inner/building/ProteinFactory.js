yc.inner.building.ProteinFactory = yc.inner.building.Building.extend({  
    //
    composition_progress: 0
    
    , working_formula: null 
    
    // 合成效率，每秒合成 5 个氨基酸
    , composition_efficient: 5
    
    , _draw: yc.inner.building.Building.prototype.draw
    , draw: function(ctx){
        if(!this.hexgon)
        {
            return ;
        }

        this._draw(ctx) ;
        
        ctx.fillStyle = 'yellow' ;
        ctx.font="normal san-serif";
        ctx.fillText('♫',-6,+5) ;
    }

    , _put: yc.inner.building.Building.prototype.put
    , put: function(hexgon){
        
        this._put(hexgon)
        
        // 开始合成
        this.startComposite() ;
        
        return yc.inner.building.Tower ;
    }
    
    , startComposite: function(){
        
        var factory = this ;
        
        
        var loopStart = this.working_formula? this.working_formula: yc.inner.ProteinFormulas.ins.last ;
        var formula = loopStart ;
        this.working_formula = null ;
        var checkingMaterials = function(formula){
            for(var key in formula.materials)
            {
                if(yc.inner.AminoAcidPool.ins()[key] < formula.materials[key])
                {
                    return false ;
                }
            }
            return true ;
        }
        do{
            
            var formula = formula.next ;
            
            // 检查状态
            if(formula.status!='waiting')
            {
                continue ;
            }
            
            // 检查氨基酸
            if(!checkingMaterials(formula))
            {
                continue ;
            }
                
            this.working_formula = formula ;
            break ;
            
        }while(formula!==loopStart) ;
        
        if(!this.working_formula)
        {
            setTimeout(function(){factory.startComposite()},1000) ;
            return ;   
        }
        
        
        // 开始合成过程
        var freq = Math.round( 1000 * (this.working_formula.total / this.composition_efficient) / 10) ;
       
        this.composition_progress = 0 ;
        this.working_formula.ui.find('.protein-composite-progress').show().progressbar({value:0}) ;
        this.working_formula.status = 'compositing' ;
        
        // 消耗氨基酸
        for(var key in formula.materials)
        {
            yc.inner.AminoAcidPool.ins().increase(key,-formula.materials[key]) ;
        }
            
        var func = function(){
            factory.composition_progress+= 10 ;            
            factory.working_formula.ui.find('.protein-composite-progress').show().progressbar({value:factory.composition_progress}) ;
            
            // 
            if( factory.composition_progress<100 )
            {
                setTimeout(func,freq) ;
            }
            
            // 完成
            else
            {
                factory.working_formula.status = 'waiting' ;
                factory.working_formula.ui.find('.protein-composite-progress').hide() ;
                
                yc.inner.ProteinPool.ins().increase(factory.working_formula.name,1) ;
                
                // next
                factory.startComposite() ;
                /*setTimeout(function(){
                    
                    // next
                    factory.startComposite() ;
                    
                },freq) ;*/
            }
        }
        setTimeout(func,freq) ;
    }
}) ;