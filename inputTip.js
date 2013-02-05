
/*
 * inputTip
 *
 * Last modified by Liber 2013-02-05
 * 
 * https://github.com/Mystist/inputTip
 *
 */
(function($){

	var downIndex = 0;
	var upIndex = 9;
	
	var methods = {
		
		init : function(options) {

			var defaults = {
				codeName : "inputCode",
				fullModel : true,
				tipPosition : "bottom",  // top, bottom
				fixDisplay : false,
				colModel : [
					{
						displayName : "名称",
						name : "itemName",
						colStyle : "color: black;font: 14px arial;height: 25px;line-height: 25px;padding: 0 8px; "
					}
				],
				tipHasShown : function() {
					//callBack after tip has shown.
				},
				clicked : function() {
					//click callBack
					
					$(this).find("td").each(function() {
					
						if($(this).css("display")!="none") {
						
							$this.find("input[name='inputTipInput']").val(this.innerText);
							$this.find("input[name='inputRealValue']").val(this.innerText);									
							return false;
						}
					});

					$this.find("div.tipDiv").remove();
					$this.css("position", "static")
						.find("input[name='inputTipInput']")
						.css("position", "static");
						
				},
				dataSourceList : []
			}
			
			var settings = $.extend(defaults, options);
			var $this = this;
			doCode($this, settings);
			
		},
		
		destory : function() {
		
			this.empty();
		}
		
	}
	
	var doCode = function($this, st) {
	
		var filteredItemList = [];
		
		var initHTML = function($this) {
		
			$this.append('<input name="inputTipInput" style="width:96%;height: 16px;line-height: 16px;" /><input name="inputRealValue" style="display:none;" />');
			
			trDelegate($this, st);
		}
		
		var initListener = function($this, st) {
		
			$this.find("input[name='inputTipInput']").bind("keydown", function(e) {
				if(e.keyCode==38) {
					e.cancelable = true;
					e.preventDefault();
				}
			});
			
			var dataSourceList = st.dataSourceList;
			$this.find("input[name='inputTipInput']").bind("keyup", function(e) {

				if(e.keyCode==40) {
					
					if(downIndex>($this.find("tbody tr").length-1)) {
						downIndex = 0;
					}
					
					$this.find("tbody tr").css("background-color", "white");
					$this.find("tbody tr").eq(downIndex).css("background-color", "#eee");
					upIndex = downIndex-1;
					
					if( downIndex<($this.find("tbody tr").length-1) ) {
						downIndex++;
					} else {
						downIndex = 0;
					}
					
				} else if(e.keyCode==38) {
				
					if( upIndex>($this.find("tbody tr").length-1) ) {
						upIndex = ($this.find("tbody tr").length-1);
					}
					if(upIndex<0) {
						upIndex = ($this.find("tbody tr").length-1);
					}
					
					$this.find("tbody tr").css("background-color", "white");
					$this.find("tbody tr").eq(upIndex).css("background-color", "#eee");
					downIndex = upIndex+1;
					
					if(upIndex>0) {
						upIndex--;
					} else {
						upIndex = ($this.find("tbody tr").length-1);
					}

				} else if(e.keyCode==13) {
				
					$this.find("tbody tr").each(function() {

						if($(this).css("background-color")=="#eee"||$(this).css("background-color")=="rgb(238, 238, 238)") {

							$(this).click();							
							return false;
						}
					});
					
				} else {
				
					downIndex = 0;
					upIndex = 9;
					
					$(this).css("position", "relative");
					$this.css("position", "relative");
					
					$this.find("div.tipDiv").remove();
					var thisValue = this.value;
					var thisValueLength = this.value.length;
					var counter = 0;
					filteredItemList = [];
					
					if(this.value!="") {
						
						for(var i=0, len=dataSourceList.length; i<len; i++) {				
							var o = dataSourceList[i];
							if(thisValue==" ") {
								filteredItemList.push(o);
								counter++;
								if(counter==10) {
									break;
								}
							} else if( o[st.codeName].slice(0, thisValueLength).toLowerCase()==$.trim(thisValue) ) {
								filteredItemList.push(o);
								counter++;
								if(counter==10) {
									break;
								}
							}
						}
					
						if(filteredItemList.length!=0) {
							$this.append(drawTipDiv(filteredItemList, st));
							setTipStyle($this, st);
						}
						
						st.tipHasShown();
					
					}
					
				}
				
			});

		}
		
		initHTML($this);
		initListener($this, st);
	
	}
	
	function drawTipDiv(list, st) {
		
		var str = '';
		
		var thStr = '';
		for(var i=0,len=st.colModel.length; i<len; i++) {
		
			thStr += '<th style="'+st.colModel[i].colStyle+' font-weight:bold; ">'+st.colModel[i].displayName+'</th>';
		}
		
		var headStr = '<thead><tr>'+thStr+'</tr></thead>';
		
		for(var i=0,len=list.length; i<len; i++) {
			
			var o = list[i];
			
			var tdStr = '';
			for(var j=0,jlen=st.colModel.length; j<jlen; j++) {
			
				tdStr += '<td style=" '+st.colModel[j].colStyle+' ">'+(o[st.colModel[j].name]==undefined?"":o[st.colModel[j].name])+'</td>';
			}
			
			str += '<tr style="background-color: white;">'+tdStr+'</tr>';
		}
		
		var sb = '<div class="tipDiv" style="position: absolute;  border: 1px solid #817F82; " >'
			+ '<table cellspacing="0" cellpadding="2" style="background-color: white;cursor: default; ">'
			+ (st.fullModel==true?headStr:"")
			+ '<tbody>'
			+ str
			+ '</tbody>'
			+ '</table>'
			+ '</div>';
			
		return sb;
	}
	
	function setTipStyle($this, st) {
	
		var tableWidth = 0;
		
		$this.find("thead tr th").each(function() {
			tableWidth += parseInt($(this).css("width"));
		});
		
		if(st.fixDisplay) {
			$this.find("table").css({
				"width" : tableWidth,
				"table-layout" : "fixed"
			});
		}
		
		if(st.tipPosition=="top") {
			$this.find("div.tipDiv").css("top", (-1-parseInt($this.find("table").height())) );
		} else {
			$this.find("div.tipDiv").css("top", 22);
		}
	}

	function trDelegate($this, st) {
	
		$this.delegate("tbody tr", "mouseover", function() {
		
			$this.find("tbody tr").css("background-color", "white");
			$(this).css("background-color", "#eee");
			
			downIndex = $(this).index()+1;
			upIndex = $(this).index()-1;
			
		});
		
		$this.delegate("tbody tr", "mouseout", function() {
		
			$(this).css("background-color", "white");
			
			downIndex = 0;
			upIndex = 9;
			
		});
		
		$this.delegate("tbody tr", "click", st.clicked);
		
	}

	$.fn.inputTip = function(method) {
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'No '+method+' .' );
		}
	}

})(jQuery);

