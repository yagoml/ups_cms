var extend=function(a,b){function c(){this.constructor=a}for(var d in b)hasProp.call(b,d)&&(a[d]=b[d]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},hasProp={}.hasOwnProperty;define(["text","start"],function(a,b){return require(["jquery","underscore","backbone","src/js/router","text!src/templates/app.html","src/js/top_menu/menu"],function(a){return function(a,b,c,d,e,f){return loadCss(baseUrl+"src/css/style.css"),loadCss(baseUrl+"src/css/yagoml_frame_styles.css"),new(function(g){function h(){return h.__super__.constructor.apply(this,arguments)}return extend(h,g),h.prototype.template=b.template(e),h.prototype.initialize=function(){return this.router=new d,c.history.start(),this.render(),this.menu()},h.prototype.render=function(){return a("body").html(this.template)},h.prototype.menu=function(){return this.menu=new f,a("header").html(this.menu.render().$el)},h}(c.View))}}())});