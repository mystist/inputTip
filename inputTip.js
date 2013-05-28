﻿/*
 * inputTip
 * 
 * https://github.com/Mystist/inputTip
 *
 * Copyright (c) 2013 Foundation and other contributors
 *
 * License: https://github.com/Mystist/inputTip/blob/master/MIT-LICENSE.txt
 *
 */
 
(function($){

	var downIndex;
	var upIndex;
	
	var methods = {
		
		init : function(options) {

			var defaults = {
				codeName : "inputCode",
				fullMode : true,
				tipPosition : "bottom",  // top, bottom
				fixDisplay : false,
				inputAttrName : "inputTipInput",
				inputOtherAttrString : "",
				topPlus : 0,
				left : null,
				maxItemNumber : 20,
				keyWordsContainMode : false,
				headStyle : "",
				inputStyle : "width:96%;height: 16px;line-height: 16px;",
				scrollTarget : ".tipDiv",
				colModel : [{
						displayName : "名称",
						name : "itemName",
						isValue : true,
						colStyle : ""
				}],
				blurhidden : false,
				clickselect: false,
				eschidden: false,
				tipHasShown : function() {
					//callback after tip has shown.2
				},
				clicked : function() {
					//callback after item has clicked.3
				},
				tipIsShowing : function() {
					//callback after tip is now showing.1
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
		var toDoItemList = [];
		
		var initHTML = function($this) {
		
			$this.append('<input '+st.inputOtherAttrString+' name="'+st.inputAttrName+'" style="'+st.inputStyle+'" />');
			
			trDelegate($this, st);
		}
		
		var initListener = function($this, st) {
			$this.find("input[name='"+st.inputAttrName+"']").bind("keydown", function(e) {
				if(e.keyCode==38) {
					e.cancelable = true;
					e.preventDefault();
				}
			});
				
			var dataSourceList = st.dataSourceList;
			$this.find("input[name='"+st.inputAttrName+"']").bind("keyup", function(e) {

				if(e.keyCode==40) {
					
					if(downIndex>($this.find("tbody tr").length-1)) {
						downIndex = 0;
					}
					
					$this.find("tbody tr").each(function() {
						$(this).css("background-color", $(this).attr("oldcolor"));
					});
					$this.find("tbody tr").eq(downIndex).css("background-color", "#d7e8f0");
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
					
					$this.find("tbody tr").each(function() {
						$(this).css("background-color", $(this).attr("oldcolor"));
					});
					$this.find("tbody tr").eq(upIndex).css("background-color", "#d7e8f0");
					downIndex = upIndex+1;
					
					if(upIndex>0) {
						upIndex--;
					} else {
						upIndex = ($this.find("tbody tr").length-1);
					}

				} else if(e.keyCode==13) {
				
					$this.find("tbody tr").each(function() {

						if($(this).css("background-color")=="#d7e8f0"||$(this).css("background-color")=="rgb(215, 232, 240)") {

							$(this).click();
							return false;
						}
					});
					
				}else if(e.keyCode == 27){
					if(st.eschidden == true){
						$this.find("div.tipDiv").remove();	
					}
				}
				else {
					downIndex = 0;
					upIndex = st.maxItemNumber-1;
					
					$(this).css("position", "relative");
					$this.css("position", "relative");
					
					$this.find("div.tipDiv").remove();
					var thisValue = this.value;
					var thisValueLength = this.value.length;
					filteredItemList = [];
					toDoItemList = [];
					
					if(this.value!="") {
						
						for(var i=0, len=dataSourceList.length; i<len; i++) {				
							var o = dataSourceList[i];
							if(thisValue==" ") {
								filteredItemList.push(o);
							} else if(o[st.codeName]) {
								if(st.keyWordsContainMode) {
									if(o[st.codeName].toLowerCase().indexOf($.trim(thisValue))!=-1) {
										filteredItemList.push(o);
									}
								} else {
									if(o[st.codeName].slice(0, thisValueLength).toLowerCase()==$.trim(thisValue)) {
										filteredItemList.push(o);
									}
								}
							}
						}
					
						if(filteredItemList.length!=0) {
							for(var i=0; i< st.maxItemNumber; i++){
								if(filteredItemList[0]) {
									toDoItemList.push(filteredItemList[0]);
									filteredItemList.shift();
								}
							}
							$this.append(drawTipDiv($this, toDoItemList, st));
							setTipStyle($this, st);
						}
						
						st.tipIsShowing();
						
						$this.find(st.scrollTarget).scroll(function() {
							
							if( $(this).scrollTop()+100 >=$this.find("table:last").height()-$(this).height() ) {
								toDoItemList = [];
								for(var i=0; i< st.maxItemNumber; i++){
									if(filteredItemList[0]) {
										toDoItemList.push(filteredItemList[0]);
										filteredItemList.shift();
									}
								}
								if(toDoItemList.length>0) {
									$this.find(".tipDiv table:last tbody").append(getDomByList($this, toDoItemList, st));
								}
							}
							
						});
					
					}
					
				}
				
			});
			
			$this.find("input[name='"+st.inputAttrName+"']").bind("blur", function(e) {
				if(st.blurhidden == true)
				{
					$this.find("tbody tr").each(function() {

						if($(this).css("background-color")=="#d7e8f0"||$(this).css("background-color")=="rgb(215, 232, 240)") {

							$(this).click();
							return false;
						}
					});
				   	$this.find("div.tipDiv").remove();	
				}
			});
			
			$this.find("input[name='"+st.inputAttrName+"']").bind("click", function(e) {
				if(st.clickselect == true)
				{
					$(e.currentTarget).select();	
				}
			});
		}
		
		
		
		initHTML($this);
		initListener($this, st);
		
		st.tipHasShown();
	
	}
	
	function drawTipDiv($this, list, st) {
		
		var str = '';
		
		var thStr = '';
		for(var i=0,len=st.colModel.length; i<len; i++) {
			var strTp = st.colModel[i].colStyle==undefined?"":st.colModel[i].colStyle;
			thStr += '<th style=" font: 12px arial;height: 27px;line-height: 25px;padding: 0 8px; width:60px; text-align: center; '+strTp+' ">'+st.colModel[i].displayName+'</th>';
		}
		
		var headStr = '<thead><tr '+st.headStyle+' >'+thStr+'</tr></thead>';
		
		str = getDomByList($this, list, st);
		
		var sb = '<div class="tipDiv" style="position: absolute; z-index:10 ;  top: -270px; left: 0;  border: 1px solid #817F82; max-height: 270px; overflow-x: hidden; overflow-y: auto; " >'
			+ '<table cellspacing="0" cellpadding="2" style="background-color: white;cursor: default; ">'
			+ (st.fullMode==true?headStr:"")
			+ '<tbody>'
			+ str
			+ '</tbody>'
			+ '</table>'
			+ '</div>';
			
		return sb;
	}
	
	function getDomByList($this, list, st) {
	
		var str = '';
		var theIndex = $this.find(".tipDiv table tbody tr").length;
	
		for(var i=0,len=list.length; i<len; i++) {
			
			var o = list[i];
			
			var tdStr = '';
			for(var j=0,jlen=st.colModel.length; j<jlen; j++) {
				var strTp = st.colModel[j].colStyle==undefined?"":st.colModel[j].colStyle;
				var isValueStr = st.colModel[j].isValue==undefined?"":"isvalue";
				var theValue = "";
				if(st.colModel[j].name==undefined && st.colModel[j].isIndex) {
					theValue = (i+1) + theIndex;
				} else if(o[st.colModel[j].name]) {
					theValue = o[st.colModel[j].name];
				}
				var oAttr = st.colModel[j].otherAttr==undefined?"":" otherattr='"+st.colModel[j].otherAttr+"' ";
				tdStr += '<td '+oAttr+' '+isValueStr+' style=" font: 12px arial;height: 27px;line-height: 25px;padding: 0 8px; width:60px; text-align: center; '+strTp+' ">'+theValue+'</td>';
			}
			
			var trColor = (i+1)%2==0?"#f9fafc":"white";
			str += '<tr oldcolor="'+trColor+'" style="background-color: '+trColor+' ">'+tdStr+'</tr>';
		}
		
		return str;
		
	}
	
	function setTipStyle($this, st) {
		
		if(st.fixDisplay) {
			$this.find("table").css({
				"width" : "100%",
				"table-layout" : "fixed"
			});
		}
		
		if(st.tipPosition=="top") {
			$this.find("div.tipDiv").css("top", (-1-parseInt($this.find(".tipDiv").height())) + st.topPlus );
		} else {
			$this.find("div.tipDiv").css("top", 22 + st.topPlus );
		}
		if(st.left!=null) {
			$this.find("div.tipDiv").css("left", st.left );
		}
	}

	function trDelegate($this, st) {
	
		$this.delegate("tbody tr", "mouseover", function() {
		
			$this.find("tbody tr").each(function() {
				$(this).css("background-color", $(this).attr("oldcolor"));
			});
			$(this).css("background-color", "#d7e8f0");
			
			downIndex = $(this).index()+1;
			upIndex = $(this).index()-1;
			
		});
		
		$this.delegate("tbody tr", "mouseout", function() {
		
			$(this).css("background-color", $(this).attr("oldcolor"));
			
			downIndex = 0;
			upIndex = st.maxItemNumber-1;
			
		});
		
		$this.delegate("tbody tr", "click", function(e) {
			$this.find("input").val($(this).find("td[isvalue]").first().text());
			$this.find("div.tipDiv").remove();
			$this.css("position", "static")
				.find("input")
				.css("position", "static");
			st.clicked(e);
		});
		
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