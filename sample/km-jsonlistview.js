/*KM-JSONListVew
  Copyright (c) 2014 Koji Matsumoto.

  description:
    JSONからページネーション付きのリストのhtmlを生成する。
    JSによる動的なページネーションの実装。
  version:
    0.2
  license:
    WTFPL
*/

function classKMJSONListView(){

  this.list_parent_id = '';
  this.list_wrapper_id = '';
  this.prop_id = '';
  this.prop_class = '';
  this.prop_id__pagination = '';
  this.prop_class__pagination = 'pagination';

  this.datalist = null;
  this.total_entry_num = 0;

  this.field = '';
  this.reverse = false;
  this.primer = parseInt;

  this.max_page_list_item_num = 5;

  this.paginate_enabled = false;
  this.paginationlink_display = 'bottom';
  this.paginate_scroll_taget_id = '';

  this.paginate_pnbtn_always_display = false;
  this.total_num_of_page = 0;
  this.paginate_focus = 0;

  this.source_empty = '';

  this.fn__getSource_ListItem = null;

  cb_end__updateSource_PaginationLink = null;
}

/*
desc:
  作成した疑似クラスのインスタンスについて、初期化を行う関数。
*/
classKMJSONListView.prototype.init = function( LstPrms ){
//console.log('>>classKMJSONListView.init() LstPrms.prop_id');

  this.list_parent_id = LstPrms.list_parent_id;
  this.prop_id = LstPrms.prop_id;

  if ( LstPrms.list_wrapper_id != undefined ){
    this.list_wrapper_id = LstPrms.list_wrapper_id;
  }
  else{
    this.list_wrapper_id = this.prop_id + "Wrapper";
  }

  this.prop_class = LstPrms.prop_class;
  this.prop_id__pagination = LstPrms.prop_id + 'Pagination';

  this.datalist = LstPrms.datalist;
  this.total_entry_num = this.datalist.length;

  this.field = LstPrms.field;
  this.reverse = LstPrms.reverse;
  this.primer = LstPrms.primer;

  //>>ページあたりの最大表示件数の設定。
  //0が設定された場合は除算によるエラーを防ぐ為規定値を設定する。
  if (LstPrms.max_page_list_item_num == 0){
    this.max_page_list_item_num = 5;
  }
  else{
    this.max_page_list_item_num = LstPrms.max_page_list_item_num;
  }
  //<<ページあたりの最大表示件数の設定。

  this.paginate_enabled = LstPrms.paginate_enabled;

  if ( LstPrms.paginationlink_display != null ){
    this.paginationlink_display = LstPrms.paginationlink_display;
  }

  if ( this.paginate_scroll_taget_id != null ){
    this.paginate_scroll_taget_id = LstPrms.paginate_scroll_taget_id;
  }
  else{ this.paginate_scroll_taget_id = this.prop_id; }

  this.paginate_pnbtn_always_display = LstPrms.paginate_pnbtn_always_display;

  //>>ページ総数の算出。
  var entry_focus = this.paginate_focus * this.max_page_list_item_num;
  if ( ( this.datalist.length % this.max_page_list_item_num ) != 0 ){
    this.total_num_of_page = Math.floor( this.datalist.length / this.max_page_list_item_num ) + 1;
/*
console.log(
 'datalist.length % this.max_page_list_item_num = ' + ( this.datalist.length % this.max_page_list_item_num ) + "\n"
  + 'datalist.length = ' + this.datalist.length + "\n"
  + 'this.total_num_of_page = ' + this.total_num_of_page );
*/
  }
  else{
    this.total_num_of_page = this.datalist.length / this.max_page_list_item_num
  }
  //<<ページ総数の算出。

  if ( LstPrms.pagination_link_btn_selecters != null ){
    this.pagination_link_btn_selecters = LstPrms.pagination_link_btn_selecters;
  }
  else{
    this.pagination_link_btn_selecters = initDefalutParam__PaginationLinkBtnSelecters();
  }


  if ( LstPrms.source__listview_wrapper != undefined ){
    this.source__listview_wrapper = LstPrms.source__listview_wrapper;
  }
  else{
    this.source__listview_wrapper = { open:"", close:"" };
  }

  if ( LstPrms.source__hash_pagination_link != null ){
    this.source__hash_pagination_link = LstPrms.source__hash_pagination_link;
  }
  else{
    this.source__hash_pagination_link = initDefalutParam__Source__HashPaginationLink();
  }

  this.source_empty = LstPrms.source_empty;

  this.fn__getSource_ListItem = LstPrms.fn__getSource_ListItem;
  this.cb_end__updateSource_PaginationLink = LstPrms.cb_end__updateSource_PaginationLink;

//>>km131114_1023:old.
/*  $( "#" + this.list_wrapper_id )
    .append( this.createSource_JSONListView() )
          .ready( this.ifPaginationEnabled() );
*/
//<<km131114_1023:old.
//>>km131114_1023:new.
  RefKMJSONList = this;
  $( "#" + this.list_parent_id )
    .append(
      this.source__listview_wrapper['open']
      + "<div id=\"" + this.list_wrapper_id + "\"></div>"
      + this.source__listview_wrapper['close']
      )
      .ready(function(){
        $( "#" + RefKMJSONList.list_wrapper_id )
          .append( RefKMJSONList.createSource_JSONListView() )
            .ready( RefKMJSONList.ifPaginationEnabled() );
      });
//<<km131114_1023:new.

  //console.log('<<classKMJSONListView.init() LstPrms.prop_id');
}

classKMJSONListView.prototype.initDefalutParam__PaginationLinkBtnSelecters = function(){

    var pagination_link_btn_selecters = {
        top:" p.top a",
        prev:" p.prev a",
        item_current:"",
        item:"ul li a",
        next:" p.next a",
        last:" p.last a"
    };

    return pagination_link_btn_selecters;
}

classKMJSONListView.prototype.initDefalutParam__Source__HashPaginationLink = function(){

    var source__hash_pagination_link = {
          open:"<div class=\"pagination\">",
          inner_html:{
            open:"<p>1～10件目を表示&nbsp;/&nbsp;全<span>50</span>件</p>"
                        +"<div>",
            btn:{
              top:"<p class=\"pre\">&lt;&lt;&nbsp;最初</p>",
              prev:"<p class=\"pre\">&lt;&nbsp;前へ</p>",
              pager:{
                open:"<ul>",
                item_current:{
                  open:"<li class=\"current\"><a href=\"#\">",
                  close:"</a></li>"
                },
                item:{
                  open:"<li><a href=\"#\">",
                  close:"</a></li>"
                },
                close:"</ul>"
              },
              next:"<p class=\"next\"><a href=\"#\">次へ&nbsp;&gt;</a></p>",
              last:"<p class=\"next\"><a href=\"#\">最後&nbsp;&gt;&gt;</a></p>"
            },
            close:"</div>"
          },
          close:"</div>"
    };

    return source__hash_pagination_link;
}

/*
desc:
  classKMJSONListView.init() のサブルーチン。
  ページネーションが設定で有効な場合に、ページネーションリンクの初期化を行う。
*/
classKMJSONListView.prototype.ifPaginationEnabled = function(){

  if ( this.paginate_enabled != false && this.datalist.length != 0 ){

    var node_str = '';

    if ( this.paginationlink_display == 'top' || this.paginationlink_display == 'both' ){
      node_str = "#" + this.prop_id__pagination + "Top";
      $( "#" + this.list_wrapper_id ).prepend( this.createSource_PaginationLink( 'top' ) )
        .ready( this.setAction_PaginationNumBtn( node_str ) )
    }
    if ( this.paginationlink_display == 'bottom' ||  this.paginationlink_display == 'both' ) {
      node_str = "#" + this.prop_id__pagination + "Bottom";
      $( "#" + this.list_wrapper_id ).append( this.createSource_PaginationLink( 'bottom' ) )
        .ready( this.setAction_PaginationNumBtn( node_str ) )

    }
  }

}


/*
km131020_1532:
description :
  jsonのソート用関数。
*/
classKMJSONListView.prototype.sort_by = function(){

    var field = this.field;
    var reverse = this.reverse;
    var primer = this.primer;

    reverse = (reverse) ? -1 : 1;
    return function(a,b){
         a = a[field];
        b = b[field];
        if (typeof(primer) != 'undefined'){
            a = primer(a);
            b = primer(b);
        }
        if (a<b) return reverse * -1;
        if (a>b) return reverse * 1;
        return 0;
    }
}

/*
desc:
  classKMJSONListView.init() のサブルーチン。
  ページネーションリンクのhtmlソースの出力。
  classKMJSONListView.init()実行時のみ実行。
*/
classKMJSONListView.prototype.createSource_PaginationLink = function( position ){

  var output_source = '';

  var source__pagelink_btns = this.updateSource_PaginationLink();

  var source__prop = '';
  if ( this.prop_id__pagination != '' ){
    if ( position == 'top' ){
     source__prop += " id=\"" + this.prop_id__pagination + "Top\"";
    }
    else if ( position == 'bottom' ){
     source__prop += " id=\"" + this.prop_id__pagination + "Bottom\"";
    }
  }

  if ( this.prop_class__pagination != '' ){ source__prop += " class=\"" + this.prop_class__pagination + "\""; }
  output_source =
        "<div" + source__prop + ">"
            + source__pagelink_btns
        + "</div>";

  return output_source;
}

/*
desc:
  ページネーションリンクのhtmlソースにおける、ルートのブロック領域配下のhtmlソースの出力。
*/
classKMJSONListView.prototype.updateSource_PaginationLink = function(){

      var hash_pagination_btns =
        this.source__hash_pagination_link['inner_html']['btn'];

  var source__pagelink_btns ='';
  for (var ic_a = 0; ic_a < this.total_num_of_page; ic_a++ ){

    var page_num_str = ic_a + 1;

    if ( ic_a == this.paginate_focus ){
      //カレントページの場合
      source__pagelink_btns +=
        hash_pagination_btns['pager']['item_current']['open']
        + page_num_str
        + hash_pagination_btns['pager']['item_current']['close'];
    }
    else{
      //カレントページ以外の場合
      source__pagelink_btns += 
        hash_pagination_btns['pager']['item']['open']
        + page_num_str
        + hash_pagination_btns['pager']['item']['close'];
    }
  }

  var output_source = "";

  var source__PrevBtn = hash_pagination_btns['prev'];
  switch( this.paginate_pnbtn_always_display ){
    case true:
      output_source += hash_pagination_btns['top'] + hash_pagination_btns['prev'];
      break;
    case false:
      if ( this.paginate_focus != 0 ){
      output_source += hash_pagination_btns['top'] + hash_pagination_btns['prev'];
      }
      break;
  }

  output_source +=
              hash_pagination_btns['pager']['open']
              + source__pagelink_btns
              + hash_pagination_btns['pager']['close'];

  var source__NextBtn = hash_pagination_btns['next'];
  switch( this.paginate_pnbtn_always_display ){
    case true:
      output_source += hash_pagination_btns['next'] + hash_pagination_btns['last'];
      break;
    case false:
    if ( this.paginate_focus != ( this.max_page_list_item_num -1 ) ){
      output_source += hash_pagination_btns['next'] + hash_pagination_btns['last'];
      }
      break;
  }

  output_source =
              this.source__hash_pagination_link['inner_html']['open']
              + output_source
              + this.source__hash_pagination_link['inner_html']['close'];

  if ( this.cb_end__updateSource_PaginationLink != null ){
    output_source = this.cb_end__updateSource_PaginationLink( this, output_source );
  }

  return output_source;
}

/*
desc:
  
*/
classKMJSONListView.prototype.updateSource_JSONListView = function(){

    var temp_str = "";
    var datalist = this.datalist;

    datalist.sort(this.sort_by());
    //km131020_1538:セミナー情報のリストを申し込み締切日でソートする。

    var source_ListNormal__list = "";

    //>>最終的な表示件数の算出。
    var page_list_item_num = 0;
    var entry_focus = this.paginate_focus * this.max_page_list_item_num;
    if ( ( datalist.length - entry_focus ) < this.max_page_list_item_num ){
      page_list_item_num = datalist.length - entry_focus;
    }
    else{
      page_list_item_num = this.max_page_list_item_num
    }
    //<<最終的な表示件数の算出。

    for (var ic_a = 0; ic_a < page_list_item_num ; ic_a++ ){
      var a_num = entry_focus + ic_a;
      source_ListNormal__list += this.fn__getSource_ListItem(datalist[a_num]);
    }

    return source_ListNormal__list;
}


classKMJSONListView.prototype.createSource_JSONListView = function(){
//console.log( '>>classKMJSONListView.createSource_JSONListView() LstPrms.prop_id' );

  var output_source;
  var source__list = this.updateSource_JSONListView();

    //公開中のセミナー情報が存在する場合は、そのリストを表示する。
    if ( source__list != "" ){

      var source__prop = '';
      if ( this.prop_id != '' ){ source__prop += " id=\"" + this.prop_id + "\""; }
      if ( this.prop_class != '' ){ source__prop += " class=\"" + this.prop_class + "\""; }
      output_source =
        "<div" + source__prop + ">"
        + "<div class=\"news-list\">" + source__list + "</div>"
        + "</div>";
    }
    else{
      output_source = this.source_empty;
    }

//console.log( '<<classKMJSONListView.createSource_JSONListView() LstPrms.prop_id' );
    return output_source;
}

classKMJSONListView.prototype.setAction_PaginationNumBtn = function( target_paginationlink_node ){
  if ( target_paginationlink_node == '' ){
    console.log( '>>classKMJSONListView.setAction_PaginationNumBtn : [error] target_paginationlink_node is Empty.' );
  }
console.log( '>>classKMJSONListView.setAction_PaginationNumBtn ' + this.prop_id );

  RefKMJSONList = this;

  var node_str = target_paginationlink_node + ' ' + this.pagination_link_btn_selecters['item'];
  $( node_str ).click(function(e){
console.log( 'PaginationLink is clicked::page_num = ' + e.target.innerHTML );
  RefKMJSONList.actionMovePage( e.target.innerHTML );
  });

  var node_str = target_paginationlink_node + ' ' + this.pagination_link_btn_selecters['top'];
  $( node_str ).click(function(e){
    var page_num = 1;
console.log( 'PaginationLink is clicked::page_num = ' + page_num );
    RefKMJSONList.actionMovePage( page_num );
  });

  var node_str = target_paginationlink_node + ' ' + this.pagination_link_btn_selecters['prev'];
  $( node_str ).click(function(e){
    var page_num = RefKMJSONList.paginate_focus +1;
    if ( page_num == 1 ){ page_num = RefKMJSONList.total_num_of_page }else{ page_num--; };
console.log( 'PaginationLink is clicked::page_num = ' + page_num );
    RefKMJSONList.actionMovePage( page_num );
  });

  var node_str = target_paginationlink_node + ' ' + this.pagination_link_btn_selecters['next'];
  $( node_str ).click(function(e){
    var page_num = RefKMJSONList.paginate_focus +1;
    if ( page_num == RefKMJSONList.total_num_of_page ){ page_num = 1; }else{ page_num++; }
console.log( 'PaginationLink is clicked::page_num = ' + page_num );
    RefKMJSONList.actionMovePage( page_num );
  });

  var node_str = target_paginationlink_node + ' ' + this.pagination_link_btn_selecters['last'];
  $( node_str ).click(function(e){
    var page_num = RefKMJSONList.total_num_of_page;
console.log( 'PaginationLink is clicked::page_num = ' + page_num );
    RefKMJSONList.actionMovePage( page_num );
  });

console.log( '<<classKMJSONListView.setAction_PaginationNumBtn ' + this.prop_id );
}


classKMJSONListView.prototype.actionMovePage = function(selected_page_num){
//  console.log('>>classKMJSONListView.actionMovePage() this.prop_id');

  this.paginate_focus = selected_page_num -1;

  var node_str = '';
  if ( this.paginationlink_display == 'top' || this.paginationlink_display == 'both' ){
    node_str = "#" + this.prop_id__pagination + "Top";
    $(node_str).html( this.updateSource_PaginationLink() ).ready( this.setAction_PaginationNumBtn( node_str ) );
  }
  if ( this.paginationlink_display == 'bottom' ||  this.paginationlink_display == 'both' ) {
    node_str = "#" + this.prop_id__pagination + "Bottom";
    $(node_str).html( this.updateSource_PaginationLink() ).ready( this.setAction_PaginationNumBtn( node_str ) );
  }

  var node_str = "#" + this.prop_id + " .news-list";

  $(node_str)
  .hide()
  .ready(
    $(node_str).html( this.updateSource_JSONListView() )
    .ready( $(node_str).fadeIn("slow") )
    );

//  console.log('<<classKMJSONListView.actionMovePage() thjs.prop_id');
}

var RefKMJSONList = null;