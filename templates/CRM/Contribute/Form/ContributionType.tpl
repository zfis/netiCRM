{*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.3                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2010                                |
 +--------------------------------------------------------------------+
 | This file is a part of CiviCRM.                                    |
 |                                                                    |
 | CiviCRM is free software; you can copy, modify, and distribute it  |
 | under the terms of the GNU Affero General Public License           |
 | Version 3, 19 November 2007 and the CiviCRM Licensing Exception.   |
 |                                                                    |
 | CiviCRM is distributed in the hope that it will be useful, but     |
 | WITHOUT ANY WARRANTY; without even the implied warranty of         |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.               |
 | See the GNU Affero General Public License for more details.        |
 |                                                                    |
 | You should have received a copy of the GNU Affero General Public   |
 | License and the CiviCRM Licensing Exception along                  |
 | with this program; if not, contact CiviCRM LLC                     |
 | at info[AT]civicrm[DOT]org. If you have questions about the        |
 | GNU Affero General Public License or the licensing of CiviCRM,     |
 | see the CiviCRM license FAQ at http://civicrm.org/licensing        |
 +--------------------------------------------------------------------+
*}
{* this template is used for adding/editing/deleting contribution type  *}
<h3>{if $action eq 1}{ts}New Contribution Type{/ts}{elseif $action eq 2}{ts}Edit Contribution Type{/ts}{else}{ts}Delete Contribution Type{/ts}{/if}</h3>
<div class="crm-block crm-form-block crm-contribution_type-form-block">
   {if $action eq 8}
      <div class="messages status">
              
          {ts}WARNING: You cannot delete a contribution type if it is currently used by any Contributions, Contribution Pages or Membership Types. Consider disabling this option instead.{/ts} {ts}Deleting a contribution type cannot be undone.{/ts} {ts}Do you want to continue?{/ts}
      </div>
   {else}
     <div class="crm-submit-buttons">{include file="CRM/common/formButtons.tpl" location="top"}</div>
     <table class="form-layout-compressed">
      <tr class="crm-contribution-form-block-name">
 	  <td class="label">{$form.name.label}</td>
	  <td class="html-adjust">{$form.name.html}</td>	
       </tr>
       <tr class="crm-contribution-form-block-description">	 
    	  <td class="label">{$form.description.label}</td>
	  <td class="html-adjust">{$form.description.html}</td>
       </tr>
       <tr class="crm-contribution-form-block-accounting_code">
    	  <td class="label">{$form.accounting_code.label}</td>
	  <td class="html-adjust">{$form.accounting_code.html}<br />
       	      <span class="description">{ts}Use this field to flag contributions of this type with the corresponding code used in your accounting system. This code will be included when you export contribution data to your accounting package.{/ts}</span>
	  </td>
       </tr>
       <tr class="crm-contribution-form-block-is_deductible">
    	  <td class="label">{$form.is_deductible.label}</td>
	  <td class="html-adjust">{$form.is_deductible.html}<br />
	      <span class="description">{ts}Are contributions of this type tax-deductible?{/ts}</span>
	  </td>
       </tr>
       <tr class="crm-contribution-form-block-is_taxreceipt">
    	  <td class="label">{$form.is_taxreceipt.label}</td>
        <td class="html-adjust">{$form.is_taxreceipt.html}<br />
          <span class="description">{ts}Are contributions of this type is a tax receipt?{/ts}</span>
          <table><tr class="crm-contribution-form-block-tax_rate">
            <td class="label">{$form.tax_rate.label}</td>
            <td class="html-adjust">{$form.tax_rate.html}%</td>
           </tr>
          </table>
        </td>
       </tr>
       <tr class="crm-contribution-form-block-is_active">	 
    	  <td class="label">{$form.is_active.label}</td>
	  <td class="html-adjust">{$form.is_active.html}</td>
       </tr>
      </table> 
   {/if}
   <div class="crm-submit-buttons">{include file="CRM/common/formButtons.tpl" location="botttom"}</div>
</div>
<script>{literal}
cj(document).ready(function($){
  var showHideTaxReceipt = function(){
    if($('#is_deductible').attr('checked')) {
      $('tr.crm-contribution-form-block-is_taxreceipt').hide();
      $('input[name=is_taxreceipt][value=0]').attr("checked", true);
    }
    else {
      $('tr.crm-contribution-form-block-is_taxreceipt').show();
    }
  }
  var showHideTaxRate = function(obj) {
    var checked = Number($(obj).val());
    if (checked < 0 ) {
      $('.crm-contribution-form-block-tax_rate').hide();
      $('#tax_rate').val('0');
    }
    else if (checked > 0) {
      $('.crm-contribution-form-block-tax_rate').show();
    }
    else if (checked == 0){
      $('.crm-contribution-form-block-tax_rate').hide();
    }
  }
  $('#is_deductible').click(showHideTaxReceipt);
  $('input[name=is_taxreceipt]').click(function(){
    showHideTaxRate(this);
  });
  showHideTaxReceipt();
  showHideTaxRate($("input[name=is_taxreceipt][checked=checked]"));
});
{/literal}</script>
