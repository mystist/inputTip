/*
 * inputTip
 * 
 * https://github.com/Mystist/inputTip
 *
 * Copyright (c) 2013 Foundation and other contributors
 *
 * License: https://github.com/Mystist/inputTip/blob/master/MIT-LICENSE.txt
 *
 */
 
(function ($) {

  var downIndex;
  var upIndex;

  var methods = {

    init: function(options) {
    
      var defaults = {
        codeName: "inputCode",
        fullMode: true,
        tipPosition: "bottom", // top, bottom
        fixDisplay: false,
        inputAttrName: "inputTipInput",
        inputOtherAttrString: "",
        topPlus: 0,
        left: null,
        maxItemNumber: 20,
        keyWordsContainMode: false,
        headStyle: "",
        inputStyle: "width:96%;height: 16px;line-height: 16px;",
        scrollTarget: "div.tipDiv",
        colModel: [{
          displayName: "名称",
          name: "itemName",
          isValue: true,
          colStyle: ""
        }],
        tipHasInitilized: function() {},
        clicked: function() {},
        tipIsShowing: function() {},
        dataSourceList: [],
        blurHidden: false,
        clickSelect: false,
        escHidden: false,
        showTipOnClick: false
      }
      var settings = $.extend(defaults, options);
      
      var $this = this;
      $this[0].settings = settings;
      
      initilize($this, $this[0].settings);
      
    },
    
    refresh: function() {
      if(this.find("div.tipDiv").length>0) {
        keyCodeDefault(this, this[0].settings);
      }
    },
    
    option: function(optionName, optionValue) {
      if(optionName&&optionValue) {
        this[0].settings[optionName] = optionValue;
      } else if(optionName) {
        if(typeof optionName == "object") {
          for(var propName in optionName) {
            this[0].settings[propName] = optionName[propName];
          }
        } else {
          return this[0].settings[optionName];
        }
      } else {
        return this[0].settings;
      }
    },
    
    destroy: function() {
      this.remove();
    }
    
  }
  
  var initilize = function($this, st) {
  
    initHtml($this, st);
    trDelegate($this, st);
    st.tipHasInitilized();
    initListener($this, st);
    
  }
  
  var initHtml = function($this, st) {
  
    $this.append('<input '+st.inputOtherAttrString+' name="'+st.inputAttrName+'" style="'+st.inputStyle+'" />');
    
  }
  
  var initListener = function($this, st) {
    
    preventDefaultKeyCodeUp($this, st);
    
    if(st.blurHidden) {
      bindBlurHidden($this, st);
    }
    
    bindInputEvents($this, st);
    
    $this.find("input[name='"+st.inputAttrName+"']").bind("keyup", function(e) {
      switch(e.keyCode) {
        case 40:
          keyCodeDown($this, st);
          break;
        case 38:
          keyCodeUp($this, st);
          break;
        case 13:
          keyCodeEnter($this, st);
          break;
        case 27:
          keyCodeEsc($this, st);
          break;
        default:
          keyCodeDefault($this, st);
      }
    });
  
  }
  
  var keyCodeDefault = function($this, st) {
  
    var dataSourceList = st.dataSourceList;
    var filteredItemList = [];
    var toDoItemList = [];
  
    downIndex = 0;
    upIndex = st.maxItemNumber-1;

    $this.find("input[name='"+st.inputAttrName+"']").css("position", "relative");
    $this.css("position", "relative");

    $("div.tipDiv").remove();
    var thisValue = $this.find("input[name='"+st.inputAttrName+"']").val();
    var thisValueLength = thisValue.length;
    filteredItemList = [];
    toDoItemList = [];

    if(thisValue!="") {
      
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
        for(var i=0; i< st.maxItemNumber; i++) {
          if(filteredItemList[0]) {
            toDoItemList.push(filteredItemList[0]);
            filteredItemList.shift();
          }
        }
      }
      
      $this.append(getTipDivHtml($this, toDoItemList, st));
      setTipStyle($this, st);
      
      st.tipIsShowing();
      
      $this.find(st.scrollTarget).unbind().scroll(function() {
        
        if( $(this).scrollTop()+100 >=$this.find("table:last").height()-$(this).height() ) {
          toDoItemList = [];
          for(var i=0; i< st.maxItemNumber; i++){
            if(filteredItemList[0]) {
              toDoItemList.push(filteredItemList[0]);
              filteredItemList.shift();
            }
          }
          if(toDoItemList.length>0) {
            $this.find(".tipDiv table:last tbody").append(getTrByList($this, toDoItemList, st));
          }
        }
        
      });

    }
  
  }
  
  var getTipDivHtml = function($this, list, st) {
  
    var str = '';

    var thStr = '';
    for(var i=0,len=st.colModel.length; i<len; i++) {
      var strTp = st.colModel[i].colStyle==undefined?"":st.colModel[i].colStyle;
      thStr += '<th style=" font: 12px arial;height: 27px;line-height: 25px;padding: 0 8px; width:60px; text-align: center; '+strTp+' ">'+st.colModel[i].displayName+'</th>';
    }

    var headStr = '<thead><tr '+st.headStyle+' >'+thStr+'</tr></thead>';

    str = getTrByList($this, list, st);

    var sb = '<div tabindex="-1" class="tipDiv" style="position: absolute; z-index:10 ;  top: -270px; left: 0;  border: 1px solid #817F82; max-height: 270px; overflow-x: hidden; overflow-y: auto; " >'
      + '<table cellspacing="0" cellpadding="2" style="background-color: white;cursor: default; ">'
      + (st.fullMode==true?headStr:"")
      + '<tbody>'
      + str
      + '</tbody>'
      + '</table>'
      + '</div>';
      
    return sb;
  
  }
  
  var getTrByList = function($this, list, st) {
  
    if(list.length==0) {
      var msg = "";
      if(st.dataSourceList.length==0) {
        msg = "数据加载中...";
      } else {
        msg = "没有匹配的项目";
      }
      return '<tr oldcolor="white" style="background-color: white"><td colspan="'+st.colModel.length+'" style=" font: 12px arial;height: 27px;line-height: 25px;padding: 0 8px; width:60px; text-align: left; ">'+msg+'</td></tr>';
    }
  
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
  
  var setTipStyle = function($this, st) {
  
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
  
  var keyCodeDown = function($this, st) {
  
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
  
  }
  
  var keyCodeUp = function($this, st) {
  
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
  
  }
  
  var keyCodeEnter = function($this, st) {
  
    $this.find("tbody tr").each(function() {
      if($(this).css("background-color")=="#d7e8f0"||$(this).css("background-color")=="rgb(215, 232, 240)") {
        $(this).click();
        return false;
      }
    });
  
  }
  
  var keyCodeEsc = function($this, st) {
  
    if(st.escHidden) {
      $this.find("div.tipDiv").remove();
    }
  
  }
  
  var preventDefaultKeyCodeUp = function($this, st) {
    $this.find("input[name='"+st.inputAttrName+"']").bind("keydown", function(e) {
      if(e.keyCode==38) {
        e.cancelable = true;
        e.preventDefault();
      }
    });
  }
  
  var bindBlurHidden = function($this, st) {
    $this.find("input[name='"+st.inputAttrName+"']").bind("blur", function() {
      setTimeout(function() {
        if($(document.activeElement).attr("class")!="tipDiv") {
          $this.find("div.tipDiv").remove();
        }
      }, 200);
    });
    $this.delegate("div.tipDiv", "blur", function() {
      setTimeout(function() {
        if($this.find("div.tipDiv").length>0) {
          $this.find("div.tipDiv").remove();
        }
      }, 200);
    });
  }
  
  
  var bindInputEvents = function($this, st) {
  
    $this.find("input[name='"+st.inputAttrName+"']").bind("click", function(e) {
      if(st.clickSelect) {
        $(e.currentTarget).select();
      }
      if(st.showTipOnClick) {
        var $target = $this.find("input[name='"+st.inputAttrName+"']");
        if($target.val()=="") {
          $this.find("input[name='"+st.inputAttrName+"']").val(" ");
          keyCodeDefault($this, st);
        }
      }
    });
  }
  
  
  var trDelegate = function($this, st) {
  
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
      $this.css("position", "static")
        .find("input")
        .css("position", "static");
      st.clicked(e);
      $this.find("div.tipDiv").remove();
    });
  
  }
  
  $.fn.inputTip = function(method) {
    if(methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error( 'No '+method+' Method.' );
    }
  };

})(jQuery);

