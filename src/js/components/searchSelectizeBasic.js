define(["jquery", "underscore", "selectize"], function($, _) {
  var searchSelectizeBasic;
  loadCss(baseUrl + "lib/selectize/css/selectize.bootstrap3.css");
  return searchSelectizeBasic = (function() {
    function searchSelectizeBasic() {}

    searchSelectizeBasic.prototype.selectize = function(options) {
      this.options = options;
      this.options.el.selectize({
        valueField: this.options.valueField,
        labelField: this.options.labelField,
        searchField: this.options.searchField,
        create: false,
        persist: false,
        preload: this.options.preLoad != null,
        placeholder: this.options.placeholder != null ? this.options.placeholder : 'Pesquisar',
        render: {
          option: (function(_this) {
            return function(item, escape) {
              if (_this.options.itemTpl != null) {
                return "<div class='option'>" + (_this.replaceKeys(_this.options.itemTpl, item)) + "</div>";
              } else {
                return "<div class='option'>" + item[_this.options.labelField] + "</div>";
              }
            };
          })(this)
        },
        load: (function(_this) {
          return function(query, callback) {
            var data;
            if (query.length <= 2 || /((?![\wáàâãéèêíïóôõöúçñ%]).)/ig.test(query)) {
              return callback();
            }
            data = {};
            if (_this.options.preData != null) {
              _.each(_this.options.preData, function(pData, i) {
                var prop;
                prop = Object.keys(pData)[i];
                return data[prop] = pData[prop];
              });
            }
            data[_this.options.labelField] = query;
            return $.ajax({
              url: _this.options.url,
              type: 'POST',
              dataType: 'json',
              data: data,
              error: function() {
                return callback();
              },
              success: function(result) {
                _this.result = result;
                return callback(_this.result);
              }
            });
          };
        })(this)
      });
      this.select = this.options.el[0].selectize;
      this.delegateEvents();
      return this.select;
    };

    searchSelectizeBasic.prototype.delegateEvents = function() {
      if (this.options.callback != null) {
        this.select.on('item_add', this.options.callback);
      }
      if (this.options.clearOnBlur != null) {
        this.select.on('blur', this.select.clearOptions);
        return $('#selectItens-selectized').keyup(this.checkKey.bind(this));
      }
    };

    searchSelectizeBasic.prototype.replaceKeys = function(template, item) {
      var keys;
      keys = template.match(/\$[\w]+/ig);
      _.each(keys, (function(_this) {
        return function(key) {
          return template = template.replace(key, item[key.replace('$', '')]);
        };
      })(this));
      return template;
    };

    searchSelectizeBasic.prototype.checkKey = function(e) {
      if (!($(e.target).val().length > 2)) {
        this.select.close();
        return this.select.clearOptions();
      }
    };

    return searchSelectizeBasic;

  })();
});
