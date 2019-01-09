(function($){

  'use strict';

  $(document).one('ready', function () {
    window.ContribPage = {
      backgroundImageUrl : window.ContribPageParams.backgroundImageUrl,
      currentContribType : "recur", // "recur", "single"
      currentContribInstrument : "creditCard", // "creditCard", "other"
      currentPage : $('#crm-container>form').attr('id'), // "Main", "Confirm", "ThankYou"
      currentPageState : "loading", // "loading", "success"
      currentPriceOption : '',
      currentPriceAmount : 0,
      currentFormStep : 1,
      currentSelectedPremiums : [],
      defaultPriceOption : {},
      singleContribMsgTitle : "您的定期支持十分重要",
      singleContribMsgText : "我們十分需要您的定期定額。",
      arrayPremiumsImg : {},

      preparePage: function(){

        $('body.frontend.page-civicrm-contribute-transact').css('background-image','url('+window.ContribPageParams.backgroundImageUrl+')');

        var $content = $('#main');
        $content.prepend($('#intro_text').prepend($('h1.page-title')));
        $('.sharethis').appendTo('body');

        this.prepareProgressBar();

        this.prepareStepInfo();

        if(this.currentPage == 'Main'){

          this.setDefaultValues();

          // this.prepareRecurBtnMsg();

          this.prepareForm();

          this.preparePriceSetBlock();

          this.setDefaultPriceOption();

          this.prepareContribTypeForm();

          // this.preparePremiumField();

          $('.instrument-info-panel').append($('#footer_text').hide());

          $('.instrument-info-panel h3').click(function(){
            $(this).toggleClass('open');
          });

          $('p.paypal').append('<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"><input name="cmd" type="hidden" value="_s-xclick" /> <input name="charset" type="hidden" value="utf-8" /> <input name="hosted_button_id" type="hidden" value="N2E54SZA5BLW4" /> <input alt="PayPal － 更安全、更簡單的線上付款方式！" border="0" name="submit" src="https://www.paypal.com/zh_HK/i/btn/btn_donateCC_LG.gif" type="image" /> <img alt="" border="0" height="1" src="https://www.paypalobjects.com/zh_TW/i/scr/pixel.gif" width="1" /></form>');
        }
        if(this.currentPage == 'confirm'){

          $('.crm-section').each(function(){
            var $parent = $(this);
            if(!$parent.is('.contributor_email-section') && !$parent.is('#intro_text')){
              $parent.hide();
              $parent.find('input[type="hidden"]').each(function(){
                $hidden = $(this);
                if($hidden.val() != ""){
                  $parent.css('display','');
                }
              });
            }
          });

          // this.preparePremiumField();
        }

        if(this.currentPage == 'thankyou'){

          $('.crm-section').find('tr').each(function(){
            var $this = $(this);
            if($this.find('.freeze-unchecked').length > 0){
              $this.hide();
            }
          });
        }
      },

      updateExpenditureSection: function(){
        if($('#expenditure-ratio-box').is(':visible')){
          $('#intro_text').fadeIn('slow');
          $('#expenditure-ratio-box').fadeOut('slow');
        }else{
          $('#intro_text').fadeOut('slow');
          $('#expenditure-ratio-box').fadeIn('slow');
        }
      },

      setDefaultValues: function(){
        $('[data-default="1"][data-grouping]').each(
          function(i, ele){
            var contribType = ele.dataset.grouping;
            var regExp = /NT\$ ([\d,]+)/;
            var label = $(ele).next().text();
            if(regExp.test(label)){
              if(contribType == 'recurring'){
                window.ContribPage.defaultPriceOption['recur'] = regExp.exec(label)[1].replace(',','');
              }else if(contribType == 'non-recurring'){
                window.ContribPage.defaultPriceOption['single'] = regExp.exec(label)[1].replace(',','');
              }else if(contribType == ''){
                window.ContribPage.defaultPriceOption['recur'] = regExp.exec(label)[1].replace(',','');
                window.ContribPage.defaultPriceOption['single'] = regExp.exec(label)[1].replace(',','');
              }
            }
          }
        );
        window.a = window.ContribPage;

        if($('[name="is_recur"]:checked').val() == 1){
          this.currentContribType = 'recur';
          if($('#installments').val()){
            this.installments = $('#installments').val();
          }
        }else{
          this.currentContribType = 'single';
        }


        if($('[name="amount"]:checked').length > 0){
          if($('[name="amount"]:checked').val() == 'amount_other_radio'){
            this.currentPriceAmount = $('#amount_other').val();
          }else{
            this.currentPriceOption = $('[name="amount"]:checked').val();
            var reg = new RegExp(/^NT\$ ([\d\,]+)/);
            var option_label = $('[name="amount"]:checked').parent().text();
            if(reg.test(option_label)){
              this.currentPriceAmount = reg.exec(option_label)[1];
            }
          }
          var reg_id = new RegExp(/[\?&]?id=/);
          if(!reg_id.test(location.search)){
            this.currentFormStep = 2;
          }
        }
      },

      prepareStepInfo: function(){
        var $stepInfo = $('<div class="custom-step-info"></div>');
        $stepInfo.append('<span class="step-text step-text-1">填寫捐款金額</span>');
        $stepInfo.append('<span class="step-triangle">▶</span>');
        $stepInfo.append('<span class="step-text step-text-2 step-text-3 step-text-4">填寫捐款人資料及收據</span>');
        $stepInfo.append('<span class="step-triangle">▶</span>');
        $stepInfo.append('<span class="step-text step-text-5">確認填寫資訊</span>');
        $stepInfo.append('<span class="step-triangle">▶</span>');
        $stepInfo.append('<span class="step-text step-text-6">信用卡資料</span>');
        $stepInfo.insertBefore('#content');
        this.updateFormStep();
      },

      prepareRecurBtnMsg: function(){
        var $msgBox = ContribPage.$msgBox = $('<div class="error-msg-bg"><div class="error-msg"><h2>'+this.singleContribMsgTitle+'</h2><p>'+this.singleContribMsgText+'</p></div></div>');
        var $singleBtn = this.createGreyBtn("我要單筆捐款");
        $singleBtn.find('a').click(function(event){
          $msgBox.animate({opacity: 0},500,function(){
            $msgBox.hide();
            $msgBox.css('opacity', 1);
            ContribPage.setContributeType('single');
          });
          event.preventDefault();
        });
        var $recurBtn = this.createBlueBtn("維持定期捐款");
        $recurBtn.find('a').click(function(event){
          ContribPage.setContributeType('recur');
          ContribPage.quitMsgBox();
          event.preventDefault();
        });
        $msgBox.find('a').click(function(event){
          if(event.originalEvent.target.classList.contains("error-msg-bg")){
            ContribPage.quitMsgBox();
          }
        });
        $msgBox.appendTo($('body')).find('.error-msg').append($singleBtn).append($recurBtn);
        $msgBox.hide();
      },

      prepareProgressBar: function(){
        if(Drupal.settings.contribution_amount && Drupal.settings.contribution_goal_amount){
          var progressNumber = this.progressNumber = parseInt(Drupal.settings.contribution_amount);
          var progressGoal = this.progressGoal = parseInt(Drupal.settings.contribution_goal_amount);
          var progressType = this.progressType = "amount";
        }else if(Drupal.settings.contribution_count && Drupal.settings.contribution_goal_count){
          var progressNumber = this.progressNumber = parseInt(Drupal.settings.contribution_count);
          var progressGoal = this.progressGoal = parseInt(Drupal.settings.contribution_goal_count);
          var progressType = this.progressType = "count";
        }

        if(progressNumber && progressGoal){
          $item = $("<div class='progress-block'><div class='progress-wrapper'><div class='progress-bar'></div></div></div>").appendTo('#intro_text');
          if(progressNumber > progressGoal ){
            var percentage = 100;
          }else{
            var percentage = ((progressNumber / progressGoal) * 100).toFixed(0);
          }
          $('.progress-bar').css('width', percentage + '%');

          if(progressType == 'amount'){
          progressNumber = progressNumber.toLocaleString();
            progressGoal = progressGoal.toLocaleString();
            $('.progress-block').prepend('<div class="progress-former-text">已募得&nbsp;'+ percentage +'%</div>');
            $('.progress-block').append('<div class="progress-text">NT$&nbsp;'+progressNumber+'&nbsp;/&nbsp;'+progressGoal+'</div>');
          }else if(progressType == 'count'){
            $('.progress-block').append('<div class="progress-text">已有 '+progressNumber+'&nbsp;/&nbsp;'+progressGoal+' 位捐款人參與行動改變環境</div>');
          }
        }
        
      },

      quitMsgBox: function(){

        var $msgBox = ContribPage.$msgBox;
        $msgBox.animate({opacity: 0},500,function(){
          $msgBox.hide();
          $msgBox.css('opacity', 1);
        });
      },

      createBlackBtn:function(text){
        return $('<span><a class="button">'+text+'</a></span>');
      },

      createGreyBtn: function(text){
        return $('<span class="crm-button-type-cancel"><a class="button">'+text+'</a></span>');
      },

      createBlueBtn: function(text){
        return $('<span class="crm-button-type-upload"><a class="button">'+text+'</a></span>');
      },

      createBtn: function(text, className){
        return $('<div class="custom-normal-btn '+className+'">'+text+'</div>');
      },

      prepareForm: function() {
        
        var dom_step = '';
        for (var i = 1; i <= 3; i++) {
          dom_step += '<div class="crm-container crm-container-md contrib-step contrib-step-'+i+'"></div>';
        }

        $(dom_step).insertBefore('.crm-contribution-main-form-block');

        $('.contrib-step-1')
          .append($('.payment_options-group'))
          .append('<div class="custom-price-set-section">')
          .append($('.payment_processor-section'))
          .append($('#billing-payment-block'))
          .append(this.createStepBtnBlock(['next-step']));
        var exec_step = 2;
        if($('.custom_pre_profile-group fieldset').length >= 1){
          $('.contrib-step-'+exec_step)
            // .append(this.createStepBtnBlock(['last-step', 'priceInfo']).addClass('crm-section').addClass('hide-as-show-all'))
            .append(this.createStepBtnBlock(['priceInfo']).addClass('crm-section').addClass('hide-as-show-all'))
            .append($('.custom_pre_profile-group'))
            .append(this.createStepBtnBlock(['last-step', 'next-step']).addClass('hide-as-show-all'));
          exec_step += 1;
        }
        if($('.custom_post_profile-group fieldset').length >= 1){
          $('.contrib-step-'+exec_step)
            // .append(this.createStepBtnBlock(['last-step', 'priceInfo']).addClass('crm-section').addClass('hide-as-show-all'))
            .append(this.createStepBtnBlock(['priceInfo']).addClass('crm-section').addClass('hide-as-show-all'))
            .append($('.custom_post_profile-group'))
            .append(this.createStepBtnBlock(['last-step', 'next-step']).addClass('hide-as-show-all'));
          exec_step += 1;
        }
        exec_step -= 1;
        $('.contrib-step-'+exec_step).find('.step-action-wrapper').has('.next-step').remove();
        $('.contrib-step-'+exec_step).append($('.crm-submit-buttons'));
        $('.contrib-step').hide();
        $('.crm-contribution-main-form-block').hide();

        if($("#billing-payment-block").length == 0){
          $('.crm-section payment_processor-section').insertBefore($('.custom_pre_profile-group'));
        }

        $('#crm-container>form').submit(function(){
          if($('label.error').length){
            ContribPage.updateShowAllStep();
          }
        })
        
        // for receipt
        var dom_crr = '<div class="custom-receipt-row"><span class="custom-receipt-row-label"></span></div>';
        var $dom_need = $(dom_crr);
        $dom_need.find('.custom-receipt-row-label')
        .text('需要')
        .after($('.custom_80-section [value=3]').closest('.crm-form-elem'))
        .after($('.custom_80-section [value=1]').closest('.crm-form-elem'));
        var $dom_dont = $(dom_crr);
        $dom_dont.find('.custom-receipt-row-label')
        .text('免寄')
        .after($('.custom_80-section [value=2]').closest('.crm-form-elem'))
        .after($('.custom_80-section [value=0]').closest('.crm-form-elem'));
        $('.custom_80-section .content')
        .prepend($dom_need)
        .prepend($dom_dont);

        $('[name="custom_80"]').each(function(){
          var $this = $(this);
          var $label = $this.next();
          var txt = $label.text();
          var reg = new RegExp(/-(.+)/);
          if(reg.test(txt)){
            var new_txt = reg.exec(txt)[1];
            $label.text(new_txt);
          }
        });

        setTimeout(function(){
          $('[for="r_name_custom"] .elem-label').text('自訂');
        }, 2000);

        this.updateFormStep();
        
      },

      createStepBtnBlock: function(objs){
        var $step_block = $('<div class="step-action-wrapper">');
        objs.forEach(function(obj_name){
          if(obj_name == 'last-step'){
            $step_block.append(ContribPage.createGreyBtn('上一步').addClass(obj_name).click(function(event){
              ContribPage.setFormStep(ContribPage.currentFormStep - 1);
              event.preventDefault();
            }));  
          }
          if(obj_name == 'next-step'){
            $step_block.append(ContribPage.createBlueBtn('下一步').addClass(obj_name).click(function(event){
              ContribPage.setFormStep(ContribPage.currentFormStep + 1);
              event.preventDefault();
            }));
          }
          if(obj_name == 'priceInfo'){
            $step_block.append('<div class="price-selected-info priceInfo"><div class="info-is-recur"></div><div class="info-price">NTD&nbsp;<span class="info-price-amount"></span></div></div>');
          }
        });
        return $step_block;
      },

      prepareContribTypeForm: function(){
        $('.contrib-step-1').prepend($('<div class="contrib-type-block custom-block"><label>點選捐款方式</label><div class="contrib-type-btn"></div></div><div class="instrument-info-panel custom-block"></div>'));
        if($('[name=is_recur][value=1]').length > 0){
          var $recurBtn = this.createBtn("線上定期","custom-recur-btn");
          $recurBtn.click(function(){
            ContribPage.setContributeType('recur');
          });
          $('.contrib-type-btn').append($recurBtn);
        }
        if($('[name=is_recur]').length==0 || $('[name=is_recur][value=0]').length > 0){
          var $singleBtn = this.createBtn("線上單筆","custom-single-btn");
          $singleBtn.click(function(){
            // ContribPage.$msgBox.show();
            ContribPage.setContributeType('single');
          });
          $('.contrib-type-btn').append($singleBtn);
        }
        this.updateContributeType();
      },

      preparePriceSetBlock: function(){
        $('<div class="priceSet-block custom-block"><label>點選金額或自訂金額</label><div class="price-set-btn"></div></div>').appendTo($('.custom-price-set-section'));
        var other_amount = '';
        if(!this.currentPriceOption){
          other_amount = this.currentPriceAmount;
        }
        var $other_amount_block = $('<div class="custom-other-amount-block custom-input-block"><label for="custom-other-amount">自訂金額</label><input placeholder="0" name="custom-other-amount" id="custom-other-amount" type="number" class="custom-input" value="'+other_amount+'"></input><a class="btn-submit-other-amount"><span>▶</span></a></div>');
        var doClickOtherAmount = function(){
          var reg = new RegExp(/\d+/);
          if(reg.test($(this).val())){
            ContribPage.setPriceOption();
            ContribPage.setPriceAmount($(this).val());
          }else{
            // $('#custom-other-amount').next().css('display', 'none');
          }
        };
        $other_amount_block.find('input').keyup(doClickOtherAmount).click(doClickOtherAmount);
        $('.btn-submit-other-amount').click(function(){
          ContribPage.setFormStep(2);
          event.preventDefault();
        });
        $('.priceSet-block').append($other_amount_block);

        if($('[name=is_recur][value=1]').length > 0){
          var installments = this.installments;
          var $installments_block = $('<div class="custom-installments-block custom-input-block"><label for="custom-installments">定期定額 期數</label><input placeholder="無限期" name="custom-installments" id="custom-installments" type="number" class="custom-input active" min="0" value="'+installments+'"></input></div>');
          var doClickInstallments = function(){
            var installments = $(this).val();
            if(installments == 0){
              $(this).val("");
            }
            ContribPage.setInstallments(installments);
          };
          $installments_block.find('input').keyup(doClickInstallments).click(doClickInstallments);
          $('.priceSet-block').append($installments_block);
        }


        this.updatePriceSetOption();
      },

      preparePremiumField: function(){
        window.$multi_select = $multi_select = $('<select multiple></select>');
        $('.custom_77-section .content td').each(function(i, e){
          var $e = $(e);
          var $input = $e.find('.crm-form-elem input');
          if($input.attr('name').search('都不要') >= 0){
            return;
          }
          if(ContribPage.currentPage == 'Main' || ($input.attr('type') == 'hidden' && $input.val() == 1)){
            var val = $input.attr('name');
            if($input.prop('checked')){
              var selected = ' selected="selected" ';
            }else{
              var selected = '';
            }
            var label = $e.find('.elem-label').text();
            if(ContribPage.arrayPremiumsImg[val]){
              var img_src = ' data-img-src="'+ContribPage.arrayPremiumsImg[val]+'" ';
            }
            var img_label = ' data-img-label="'+label+'" ';
            var $option = $('<option value="'+val+'" '+img_src+img_label+selected+' >'+label+'</option>');
            $multi_select.append($option);
            
          }
        });
      },

      updatePriceSetOption: function(){
        $('.price-set-btn').html("");
        var reg = new RegExp(/^NT\$ ([\d\,]+) ?(.*)$/);
        var grouping_text = (this.currentContribType == 'recur')?"recurring":"non-recurring";
        $('.amount-section label.crm-form-radio').each(function(ele){
          var $this = $(this);
          var this_grouping = $this.find('input').data('grouping');
          if(this_grouping == grouping_text || this_grouping == ''){
            var text = $(this).find('.elem-label').text();
            if(reg.test(text)){
              var reg_result = reg.exec(text);
              var amount = reg_result[1];
              var val = $this.find('input').val();
              var $option = $('<div data-amount="'+val+'"><span class="amount">'+amount+'</span><span class="description">'+reg_result[2]+'</span></div>');
              $option.click(function(){
                ContribPage.setPriceOption($(this).data('amount'));
                // ContribPage.setFormStep(2);
              });
              $('.price-set-btn').append($option);
            }
          }
        });
        this.updatePriceOption();
        this.updatePriceAmount();
      },

      setPriceOption: function(val){
        this.currentPriceOption = val;
        if(this.currentPriceOption){
          $('.amount-section [value="'+this.currentPriceOption+'"]').click();
          var amount = $('.price-set-btn div[data-amount='+this.currentPriceOption+'] .amount').text();
          this.setPriceAmount(amount);
          // $('.btn-submit-other-amount').hide();
        }else{
          $('.amount-section .crm-form-radio:last-child input').click();
        }
        this.updatePriceOption();
      },

      updatePriceOption: function(){
        $('.price-set-btn div').removeClass('active');
        if(this.currentPriceOption){
          $('.price-set-btn div[data-amount='+this.currentPriceOption+']').addClass('active');  
        }
      },

      setPriceAmount: function(amount){
        if(this.currentPriceAmount != amount){
          this.currentPriceAmount = amount;
          if(!this.currentPriceOption){
            $('input#amount_other').val(this.currentPriceAmount);
          }
          this.updatePriceAmount();
        }
      },

      updatePriceAmount: function(){
        // $('.btn-submit-other-amount').css('display', 'hide');
        $('.info-price-amount').text(this.currentPriceAmount);
        if(this.currentPriceAmount && !this.currentPriceOption){
          // $('.btn-submit-other-amount').css('display', 'inline-block');
          $('input#custom-other-amount').addClass('active');
        }else{
          $('input#custom-other-amount').val('').removeClass('active');
        }
      },

      /**
       * 如果 setContributeType 的時候要做 setContribInstrument 
       * @param {[type]} type [description]
       */
      setContributeType: function(type) {
        if( this.currentContribType != type ){
          this.currentContribType = type;
          if(!this.currentContribType){
            return;
          }
          if(this.currentContribType == 'single'){
            $('[name=is_recur][value=0]').click();
            this.setContribInstrument('creditCard');
          }
          if(this.currentContribType == 'recur'){
            this.setContribInstrument('creditCard');
            $('[name=is_recur][value=1]').click();
          }
          if(this.defaultPriceOption[this.currentContribType]){
            this.currentPriceAmount = this.defaultPriceOption[this.currentContribType].replace(',','');
          }

          this.updateContributeType();
          this.setDefaultPriceOption();
        }
      },

      setDefaultPriceOption: function(){
        if(typeof this.currentPriceAmount == 'string'){
          var amount = this.currentPriceAmount.replace(',','');
        }else{
          var amount = this.currentPriceAmount;
        }
        var grouping_text = (ContribPage.currentContribType == 'recur')?"recurring":"non-recurring";
        $('.amount-section .content .crm-form-radio').each(function(){
          var $this = $(this);
          var text = $this.find('.elem-label').text().replace(',','');
          var this_grouping = $this.find('input').attr('data-grouping');
          if(text.match(' '+amount+' ') && (this_grouping == grouping_text || this_grouping == '')){
            ContribPage.setPriceOption($this.find('input').val());
          }
        })
      },

      updateContributeType: function() {
        if(this.currentContribType == 'single'){
          $('.contrib-type-btn div').removeClass('selected');
          $('.custom-single-btn').addClass('selected');
          $('.info-is-recur').text('單筆捐款');
          $('.custom-installments-block').hide();
        }
        if(this.currentContribType == 'recur'){
          $('.contrib-type-btn div').removeClass('selected');
          $('.custom-recur-btn').addClass('selected');
          if(!this.installments){
            $('.info-is-recur').text('每月捐款');
          }else{
            $('.info-is-recur').text(this.installments+'期每月捐款');
          }
          $('.custom-installments-block').show();
        }
        this.updatePriceSetOption();
      },

      setFormStep: function(step) {
        $('.hide-as-show-all').show();
        if(this.currentFormStep != step){
          this.currentFormStep = step;
          this.updateFormStep();
        }
      },

      updateFormStep: function() {
        var currentStepClassName = 'contrib-step-'+this.currentFormStep;
        $('[class*=contrib-step-]').each(function(){
          var $this = $(this);
          /**
          class name use type:
            * type-is-back
            * type-is-front
          */
          if($this.hasClass('type-is-front') && !$this.hasClass(currentStepClassName)){
            $this.fadeOut('slow', function(){
              // $this.removeClass('active-contrib-step');
              $this.removeClass('type-is-front').addClass('type-is-back');
              $this.css({
                'display':'block'
              })
            });
          }
          if($this.hasClass(currentStepClassName)){
            $this.removeClass('type-is-back').addClass('type-is-front');
            $this.fadeIn('slow', function(){
              // $this.addClass('active-contrib-step');
              $this.css({
                'position':''
              });
            });
          }
        });

        $('.step-text').removeClass('active');
        if(this.currentPage == 'Main'){
          $('.step-text-' + this.currentFormStep).addClass('active');
          if($(window).width() <= 480){
            $('.custom-step-info').scrollLeft($('.custom-step-info span.active').offset().left-($('.custom-step-info span.active').width()/2));
          }
        }else if(this.currentPage == 'confirm'){
          $('.custom-step-info').scrollLeft($('.step-text-5').offset().left);
          $('.step-text-5').addClass('active');
        }
      },

      updateShowAllStep: function(){
        $('.hide-as-show-all').hide();
        $('[class*=contrib-step-]').each(function(){
          var $this = $(this);
          if($this.hasClass('contrib-step-1'))return ;
          $this.removeClass('type-is-back').addClass('type-is-front');
          $this.fadeIn('slow');
        });
        ContribPage.currentFormStep = 2;
      },

      setPageState: function(state) {
        this.currentPageState = state;
        this.updatePageState();
      },

      updatePageState: function() {

      },

      setContribInstrument: function(insType) { 
        if(this.currentContribInstrument !== insType){
          this.currentContribInstrument = insType;
          if(insType == 'other'){
            this.setContributeType('');
          }
          this.updateContribInstrument();
        }
      },

      updateContribInstrument: function() {
        $('.contrib-type-btn div').removeClass('selected');
        if(this.currentContribInstrument == 'creditCard'){
          $('#footer_text').animate({'opacity': 0} ,500, function(){
            $('#footer_text').hide();
            $('.priceSet-block').show().css({'opacity': 0}).animate({'opacity': 1} ,500);
          });
        }
        if(this.currentContribInstrument == 'other'){
          $('.priceSet-block').animate({'opacity': 0}, 500, function(){
            $('.priceSet-block').hide();
            $('#footer_text').show().css({'opacity': 0}).animate({'opacity': 1} ,500);
          });
          $('.other-instrument-btn').addClass('selected');
        }
        
      },

      setSelectedPremiums: function(selection){
        if(!this.isArraysEqual(this.currentSelectedPremiums, selection)){
          this.currentSelectedPremiums = selection;

          if(!this.currentSelectedPremiums || this.currentSelectedPremiums.length == 0){
            $('.custom_77-section .content td').find('.crm-form-checkbox input').prop('checked', false);
            $('input#custom_77\\\[都不要\\\]').prop('checked', true);
          }else{
            $('.custom_77-section .content td').find('.crm-form-checkbox input').each(function(){
              var $this = $(this);
              if($.inArray($this.attr('id'), ContribPage.currentSelectedPremiums) !== -1){
                $this.prop('checked', true);
              }else{
                $this.prop('checked', false);
              }
            });
          }
        }
      },

      setInstallments: function(installments) {
        if(this.installments != installments){
          this.installments = installments;
          $('#installments').val(installments)
          this.updateInstallments();
        }
      },

      updateInstallments: function(){
        this.updateContributeType();
      },

      isArraysEqual: function(a, b) {
        // refs: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.

        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      },

      prepareAfterAll: function(){
        $('.payment_options-group').hide();
        $('#main').css('opacity', 1);
        $('#page').css('background', 'none').css('height','unset');

      }


    };
    try{
      window.ContribPage.preparePage();
    }catch(e){
      window.ContribPage.prepareAfterAll();
    }
    window.ContribPage.prepareAfterAll();
  });
})(jQuery);