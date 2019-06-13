var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "underscore", "backbone", ENV + "/js/router", ENV + "/js/components/autoCrud/dataTable", ENV + "/js/components/autoCrud/newData", ENV + "/js/components/autoCrud/editData", ENV + "/js/components/autoCrud/dataFilters", ENV + "/js/components/autoCrud/inputTypes", ENV + "/js/components/loader", "text!src/templates/components/autoCrud/autoCrud.html", "text!src/templates/components/autoCrud/newDataTpl.html", "text!src/templates/components/autoCrud/editDataTpl.html", "text!lib/fine-uploader/templates/gallery.html", "text!lib/fine-uploader/templates/simple-thumbnails.html", "text!src/templates/components/upload/upload.html", "lib/fine-uploader/jquery.fine-uploader.min", "lib/jquery-ui-sortable/jquery-ui.min"], function($, _, Backbone, Router, DataTable, NewData, EditData, dataFilters, InputTypes, Loader, AutoCrudTpl, NewDataTpl, EditDataTpl, FnUploadGalleryTpl, FnUploadSimpleThumbsTpl, UploadTpl) {
  var AutoCrudView, Ordenator, URL, mLoader;
  URL = baseUrl + "dados/";
  mLoader = new Loader({
    "class": 'mLoader'
  });
  loadCss(baseUrl + "lib/fine-uploader/fine-uploader-new.min.css");
  loadCss(baseUrl + "lib/fine-uploader/fine-uploader-gallery.min.css");
  loadCss(baseUrl + "lib/jquery-ui-sortable/jquery-ui.min.css");
  loadCss((baseUrl + ENV) + "/css/components/autoCrud.css");
  Ordenator = (function() {
    function Ordenator() {}

    Ordenator.addOrder = function(data) {
      return $.ajax({
        method: 'POST',
        dataType: 'json',
        url: baseUrl + "dados/addOrder",
        data: {
          table: data.table,
          id: data.model.get(data.pk),
          data: data.model.attributes
        }
      });
    };

    Ordenator.subOrder = function(data) {
      return $.ajax({
        method: 'POST',
        dataType: 'json',
        url: baseUrl + "dados/subOrder",
        data: {
          table: data.table,
          id: data.model.get(data.pk),
          data: data.model.attributes
        }
      });
    };

    Ordenator.setOrder = function(data) {
      return $.ajax({
        method: 'POST',
        dataType: 'json',
        url: baseUrl + "dados/setOrder",
        data: {
          table: data.table,
          id: data.model.get(data.pk),
          data: data.model.attributes,
          ordem: data.ordem
        }
      });
    };

    return Ordenator;

  })();
  return AutoCrudView = (function(superClass) {
    extend(AutoCrudView, superClass);

    function AutoCrudView() {
      return AutoCrudView.__super__.constructor.apply(this, arguments);
    }

    AutoCrudView.prototype.className = 'auto-crud';

    AutoCrudView.prototype.template = _.template(AutoCrudTpl);

    AutoCrudView.prototype.qtdDados = 20;

    AutoCrudView.prototype.events = {
      'click #newData': 'openNewData',
      'click #filtrarDados': 'openWindowdataFilters',
      'click #removerFiltro': 'removerFiltro',
      'click #deleteData': 'deleteList',
      'click #backGrid': 'backGrid',
      'click #deleteDataEdit': 'deleteDataEdit',
      'sortupdate .qq-upload-list': 'dragFile',
      'click .qq-thumbnail-selector': 'openFile'
    };

    AutoCrudView.prototype.resetPaginationControls = function() {
      return this.paginationControls = {
        limiteBuscaAtingido: false,
        requisicaoAtiva: false,
        paginaAtual: 1
      };
    };

    AutoCrudView.prototype.initialize = function(options) {
      this.options = options;
      this.defCmsAccessTables = this.getCmsTables();
      this.defAllowAccess = $.Deferred();
      this.configSite = this.options.table === 'config_site';
      this.filesCollection = false;
      this.resetPaginationControls();
      return $.when(this.defCmsAccessTables).done((function(_this) {
        return function() {
          var ref;
          ref = _this.options, _this.table = ref.table, _this.filterID = ref.filterID, _this.edit = ref.edit, _this.newData = ref.newData, _this.parentTable = ref.parentTable, _this.pk = ref.pk, _this.fk = ref.fk;
          _this.allowAcess = _.findWhere(_this.cmsAccessTables, {
            table: _this.table
          }) || (_this.fk != null);
          if (_this.allowAcess) {
            if (!_this.edit && _this.configSite) {
              return;
            }
            _this.renderizeTable = _this.options.renderTable || true;
            _this.collection = new Backbone.Collection;
            _this.checkedModels = new Backbone.Collection;
            _this.collection.url = URL;
            _this.colFetchDef = $.Deferred();
            _this.colFetchDef.promise();
            _this.tableInfos = _this.getTableInfos();
            _this.defFetchData = $.Deferred();
            _this.defFetchData.promise();
            if (_this.newData) {
              $.when.apply($, [_this.getTableTitles(), _this.getFKs(), _this.getSystemFields()]).done(function(model) {
                _this.colFetchDef.resolve();
                return _this.openNewData();
              });
            } else {
              _this.filesCollection = true;
            }
          } else {
            Router.navigate("#admin");
          }
          return _this.defAllowAccess.resolve();
        };
      })(this));
    };

    AutoCrudView.prototype.getCmsTables = function() {
      return $.ajax({
        type: 'post',
        dataType: 'json',
        url: baseUrl + "tableInfos/cmsTables",
        success: (function(_this) {
          return function(cmsAccessTables) {
            _this.cmsAccessTables = cmsAccessTables;
          };
        })(this)
      });
    };

    AutoCrudView.prototype.prepareCollection = function() {
      this.pk = (_.findWhere(this.tableInfos, {
        primary_key: 1
      })).name;
      if (!this.edit) {
        if (this.filterID) {
          if (this.fk != null) {
            this.fetchData = {
              table: this.table,
              fk: this.fk,
              filterID: this.filterID,
              pagina: 0
            };
          } else {
            this.fetchData = {
              table: this.table,
              pk: this.pk,
              filterID: this.filterID,
              pagina: 0
            };
          }
        } else {
          this.fetchData = {
            table: this.table,
            pagina: 0
          };
        }
        this.defFetchData.resolve();
        this.collection.fetch({
          data: this.fetchData,
          success: (function(_this) {
            return function() {
              _this.colFetchDef.resolve();
              _this.showQtdDados();
              if (_this.checkForFilesTable(_this.tableInfos)) {
                _this.filesCollectionUpload();
                return _this.$('#newData').hide();
              } else {
                _this.$('#newData').show();
                if (_this.renderizeTable) {
                  return $.when.apply($, [_this.getTableTitles(), _this.getFKs()]).done(function() {
                    _this.createTable();
                    return _this.delegateEvents();
                  });
                }
              }
            };
          })(this)
        });
      } else {
        this.$('#newData').show();
        if (this.configSite) {
          this.$('#buttonsArea').remove();
        }
        $.when.apply($, [this.defItemData = this.getItemData(this.filterID), this.getTableTitles(), this.getFKs()]).done((function(_this) {
          return function(model) {
            _this.editModel = model;
            _this.colFetchDef.resolve();
            return _this.openEditData(model);
          };
        })(this));
      }
      this.collection.on('update', this.updateRegCounter, this);
      return this.editing = false;
    };

    AutoCrudView.prototype.delegateEvents = function() {
      AutoCrudView.__super__.delegateEvents.apply(this, arguments);
      if (this.crudTableView != null) {
        this.crudTableView.delegateEvents();
        this.listenTo(this.crudTableView, 'openEditData', this.openEditData);
        this.listenTo(this.crudTableView, 'itemChecked', this.interactExcBtn);
        this.listenTo(this.crudTableView, 'removeData', this.deletarDado);
        this.listenTo(this.crudTableView, 'dadosSolicitados', this.nextScrollPage);
        this.listenTo(this.crudTableView, 'addOrder', this.addOrder);
        this.listenTo(this.crudTableView, 'subOrder', this.subOrder);
      }
      return this.$('#dataTableContent .table-responsive').on('scroll', (function(_this) {
        return function(e) {
          return _this.scroll();
        };
      })(this));
    };

    AutoCrudView.prototype.undelegateEvents = function() {
      AutoCrudView.__super__.undelegateEvents.apply(this, arguments);
      if (this.crudTableView != null) {
        this.crudTableView.undelegateEvents();
        this.stopListening(this.crudTableView, 'openEditData');
        this.stopListening(this.crudTableView, 'itemChecked');
        this.stopListening(this.crudTableView, 'removeData');
        this.stopListening(this.crudTableView, 'addOrder');
        return this.stopListening(this.crudTableView, 'subOrder');
      }
    };

    AutoCrudView.prototype.render = function() {
      $.when(this.defAllowAccess).done((function(_this) {
        return function() {
          if (_this.allowAcess) {
            _this.autoCrudEL = _this.template({
              table: _this.table,
              gurmetTable: _this.allowAcess.name || capitalize(_this.table.replace(/(?![a-zA-Z0-9])./g, ' ')),
              parentTable: _this.parentTable ? _this.parentTable : void 0,
              filterID: _this.parentTable ? _this.filterID : void 0
            });
            _this.$el.html(_this.autoCrudEL);
            _this.$('#dataTableContent').html(mLoader.show());
            if (_this.filesCollection) {
              return $.when.apply($, [_this.tableInfos, _this.getSystemFields()]).done(function() {
                return _this.prepareCollection();
              });
            }
          }
        };
      })(this));
      return this;
    };

    AutoCrudView.prototype.openEditData = function(model) {
      this.editModel = model;
      this.edit = true;
      return $.when.apply($, [this.colFetchDef, this.tableInfos, this.getRefTables()]).done((function(_this) {
        return function() {
          var obj;
          if (!(model instanceof Backbone.Model)) {
            model = _this.collection.findWhere((
              obj = {},
              obj["" + _this.pk] = model,
              obj
            ));
          }
          Router.navigate("admin/autoCrud/" + _this.table + "/edit/" + (model.get(_this.pk)), {
            trigger: false
          });
          _this.editData = new EditData({
            model: model,
            table: _this.table,
            tableInfos: _this.tableInfos,
            tableTitles: _this.tableTitles,
            systemFields: _this.systemFields,
            inputTypes: InputTypes,
            fks: _this.fks,
            pk: _this.pk,
            refTables: _this.refTables,
            parentTable: _this.parentTable,
            configSite: _this.configSite
          });
          _this.$('#dataTableContent').html(_this.editData.render().$el);
          _this.editData.afterRender();
          _this.listenTo(_this.editData, 'backFromEdit', _this.renderTable.bind(_this));
          _this.$('#backGrid').removeClass('hidden');
          _this.$('#deleteData').hide();
          return _this.$('#deleteDataEdit').show();
        };
      })(this));
    };

    AutoCrudView.prototype.getItemData = function(itemID) {
      var def;
      def = $.Deferred();
      $.ajax({
        type: 'get',
        dataType: 'json',
        url: baseUrl + "dados",
        data: {
          table: this.table,
          pk: this.pk,
          filterID: this.filterID,
          orderBy: this.configSite ? '' : void 0
        },
        success: (function(_this) {
          return function(itemData) {
            return def.resolve(new Backbone.Model(itemData[0]));
          };
        })(this)
      });
      return def.promise();
    };

    AutoCrudView.prototype.openNewData = function(event) {
      return $.when.apply($, [this.colFetchDef, this.tableInfos, this.getRefTables()]).done((function(_this) {
        return function() {
          if (_this.fk != null) {
            Router.navigate("admin/autoCrud/" + _this.parentTable + "/related/" + _this.table + "/" + _this.fk + "/" + _this.filterID + "/new", {
              trigger: false
            });
          } else {
            Router.navigate("admin/autoCrud/" + _this.table + "/new", {
              trigger: false
            });
          }
          _this.newData = new NewData({
            model: new Backbone.Model,
            table: _this.table,
            tableInfos: _this.tableInfos,
            tableTitles: _this.tableTitles,
            systemFields: _this.systemFields,
            inputTypes: InputTypes,
            fks: _this.fks,
            pk: _this.pk,
            refTables: _this.refTables,
            parentTable: _this.parentTable,
            fk: _this.fk != null ? _this.fk : void 0,
            filterID: _this.filterID != null ? _this.filterID : void 0
          });
          _this.listenTo(_this.newData, 'backFromEdit', _this.renderTable.bind(_this));
          _this.$('#dataTableContent').html(_this.newData.render().$el);
          _this.newData.afterRender();
          _this.$('#backParent').removeClass('hidden');
          _this.$('#newData').hide();
          return _this.$('#deleteData').hide();
        };
      })(this));
    };

    AutoCrudView.prototype.openWindowdataFilters = function() {
      this.windowdataFilters = new dataFilters({
        model: this.model
      });
      this.stopListening(this.windowdataFilters);
      this.listenTo(this.windowdataFilters, 'eventoFiltrado', this.filtrarDados.bind(this));
      return this.$('#dataTableContent').append(this.windowdataFilters.render());
    };

    AutoCrudView.prototype.addDado = function(dadosDado) {
      var evento;
      this.endTableLoader('show');
      evento = ((new Dado).set(dadosDado)).attributes;
      return this.collection.create(evento, {
        wait: true,
        success: (function(_this) {
          return function(evento) {
            _this.crudTableView.addLinha(evento);
            return _this.endTableLoader('hide');
          };
        })(this)
      });
    };

    AutoCrudView.prototype.editDado = function(evento) {
      var novoDado;
      this.crudTableView.loaderLinha(evento.id_evento);
      novoDado = ((new Dado).set(evento)).attributes;
      return this.model.save(novoDado, {
        wait: true,
        success: (function(_this) {
          return function() {
            return _this.crudTableView.editLinha(novoDado);
          };
        })(this)
      });
    };

    AutoCrudView.prototype.filtrarDados = function(filtro) {
      return $.ajax({
        url: baseUrl + "dados/filtro",
        type: 'POST',
        dataType: "json",
        data: filtro,
        success: (function(_this) {
          return function(dadosFiltrados) {
            _this.collection = new Dados;
            _.each(dadosFiltrados, function(novoDado) {
              return _this.collection.models.push((new Dado).set(novoDado));
            });
            _this.createTable();
            return _this.renderfiltroAplicado(filtro);
          };
        })(this)
      });
    };

    AutoCrudView.prototype.deletarDado = function(models) {
      var delDef, ids;
      delDef = $.Deferred();
      ids = [];
      _.each(models, (function(_this) {
        return function(model) {
          var id;
          id = model.get(_this.pk);
          return ids.push(id);
        };
      })(this));
      $.ajax({
        type: 'POST',
        data: {
          table: this.table,
          ids: ids,
          pk: this.pk
        },
        url: URL + "removeData",
        success: (function(_this) {
          return function() {
            _this.collection.remove(models);
            return delDef.resolve();
          };
        })(this)
      });
      return delDef.promise();
    };

    AutoCrudView.prototype.deleteList = function() {
      var chklen;
      chklen = this.checkedModels.models.length;
      if (window.confirm("Deseja realmente excluir " + (chklen > 1 ? 'os ' + chklen + ' registros selecionados' : ' o registro #' + _.first(this.checkedModels.models).get(this.pk)) + "? Todos os dados relacionados serão excluídos também.")) {
        return $.when(this.deletarDado(this.checkedModels.models)).done((function(_this) {
          return function() {
            var $btn, j;
            _this.crudTableView.removeLines(_this.checkedModels.models);
            _this.checkedModels.reset();
            $btn = _this.$('#deleteData');
            $btn.find('#qntSelectedItens').empty();
            $btn.hide();
            if (chklen >= 20) {
              for (j = 1; j >= 0; j--) {
                _this.nextScrollPage(_this.paginationControls.paginaAtual);
              }
              _this.ultimaPosicaoScroll = 0;
            }
            _this.crudTableView.$('#dadosSelectAll')[0].checked = false;
            return _this.crudTableView.selectAllState = false;
          };
        })(this));
      }
    };

    AutoCrudView.prototype.createTable = function() {
      this.$('#dataTableContent').html(mLoader.show());
      this.crudTableView = new DataTable({
        dados: this.collection,
        systemFields: this.systemFields,
        tableTitles: this.tableTitles != null ? this.tableTitles : void 0,
        pk: this.pk,
        fk: this.fk != null ? this.fk : void 0,
        fks: this.fks
      });
      this.$('#dataTableContent').html(this.crudTableView.render().$el);
      return this.crudTableView.ellipsisTableData();
    };

    AutoCrudView.prototype.renderTable = function(model) {
      var idx;
      if (model == null) {
        model = {};
      }
      if (!this.configSite) {
        if (this.fk != null) {
          Router.navigate("admin/autoCrud/" + this.parentTable + "/related/" + this.table + "/" + this.fk + "/" + this.filterID, {
            trigger: false
          });
        } else {
          Router.navigate("admin/autoCrud/" + this.table, {
            trigger: false
          });
        }
        if (this.crudTableView != null) {
          $('#panelContent').html(this.$el);
          this.$('#dataTableContent').css({
            'margin-top': '0'
          });
          this.$('#dataTableContent').html(this.crudTableView.$el);
          if (!this.fk) {
            this.$('#backParent').addClass('hidden');
          }
          this.$('#backGrid').addClass('hidden');
          this.$('.table-responsive').find('.loader-wrapper').remove();
          this.$('#deleteDataEdit').hide();
          if (!_.isEmpty(model)) {
            idx = this.collection.findIndex(model);
            if (idx >= 0) {
              this.editing = true;
              this.collection.models[idx] = model;
              this.crudTableView.updateLinha(model);
            } else {
              this.editing = false;
              this.collection.add(model);
            }
          }
          this.delegateEvents();
        } else {
          this.resetPaginationControls();
          $('#panelContent').html(this.render().$el);
          if (!this.edit && this.configSite) {
            return;
          }
          this.collection.fetch({
            data: {
              pagina: 0,
              table: this.table
            },
            success: (function(_this) {
              return function() {
                _this.createTable();
                _this.showQtdDados();
                return _this.delegateEvents();
              };
            })(this)
          });
        }
        this.defFetchData.resolve();
        return this.$('#newData').show();
      }
    };

    AutoCrudView.prototype.getTableTitles = function() {
      return $.ajax({
        type: 'POST',
        dataType: 'json',
        url: baseUrl + "tableInfos/titles",
        data: {
          table: this.table
        },
        success: (function(_this) {
          return function(tableTitles) {
            _this.tableTitles = tableTitles;
          };
        })(this)
      });
    };

    AutoCrudView.prototype.endTableLoader = function(command) {
      return this.crudTableView.endTableLoader(command);
    };

    AutoCrudView.prototype.tableLoader = function(command) {
      if (command === 'show') {
        return this.$('#dataTableContent').prepend(mLoader.show());
      } else {
        return this.$('#dataTableContent').children('.loader-wrapper').remove();
      }
    };

    AutoCrudView.prototype.renderfiltroAplicado = function(filtro) {
      var filtroInfos;
      filtroInfos = [];
      this.$('#titleFiltro').css('display', 'block');
      if (filtro.id_evento.length > 0) {
        filtroInfos.push("ID Dado: <span class='pad5 alert-info'>" + filtro.id_evento + "</span>");
      }
      if (filtro.tipo.length > 0) {
        filtroInfos.push("Tipo contém: <span class='pad5 alert-info'>" + filtro.tipo + "</span>");
      }
      return _.each(filtroInfos, (function(_this) {
        return function(filtroInfo) {
          return _this.$('#filtroInfos').append("<li>" + filtroInfo + "</li>");
        };
      })(this));
    };

    AutoCrudView.prototype.removerFiltro = function() {
      this.$('#dataTableContent').html(mLoader.show());
      this.initialize();
      this.$('#titleFiltro').css('display', 'none');
      return this.$('#filtroInfos').html('');
    };

    AutoCrudView.prototype.showQtdDados = function() {
      return this.$('#qtdDados').html(this.collection.models.length);
    };

    AutoCrudView.prototype.getDataPage = function(pagina) {
      return $.ajax({
        type: 'get',
        dataType: 'json',
        url: baseUrl + "dados",
        data: this.fetchData,
        success: (function(_this) {
          return function(data) {
            if (data.length) {
              _.each(data, function(item) {
                var model;
                model = (new Backbone.Model).set(item);
                return _this.collection.add(model);
              });
              return _this.crudTableView.ellipsisTableData();
            } else {
              return _this.paginationControls.limiteBuscaAtingido = true;
            }
          };
        })(this)
      });
    };

    AutoCrudView.prototype.getTableInfos = function() {
      return $.ajax({
        type: 'POST',
        dataType: 'json',
        url: baseUrl + "tableInfos",
        data: {
          table: this.table
        },
        success: (function(_this) {
          return function(tableData) {
            _this.tableInfos = tableData.fieldsData;
            return _this.tableFks = tableData.fksData;
          };
        })(this)
      });
    };

    AutoCrudView.prototype.getFKs = function() {
      return $.ajax({
        type: 'POST',
        dataType: 'json',
        url: baseUrl + "tableInfos/fks",
        success: (function(_this) {
          return function(fks) {
            _this.fks = fks;
          };
        })(this)
      });
    };

    AutoCrudView.prototype.getSystemFields = function() {
      return $.ajax({
        type: 'POST',
        dataType: 'json',
        url: baseUrl + "tableInfos/systemFields",
        success: (function(_this) {
          return function(systemFields) {
            _this.systemFields = systemFields;
          };
        })(this)
      });
    };

    AutoCrudView.prototype.getRefTables = function() {
      return $.ajax({
        type: 'post',
        dataType: 'json',
        url: baseUrl + "tableInfos/getTableFKs",
        data: {
          table: this.table
        },
        success: (function(_this) {
          return function(refTables) {
            _this.refTables = refTables;
          };
        })(this)
      });
    };

    AutoCrudView.prototype.filesCollectionUpload = function() {
      var fieldDir;
      this.$('#dataTableContent').html(UploadTpl);
      if (_.any(this.collection.models)) {
        fieldDir = this.getFieldDirectory(this.collection.models[0]);
      }
      this.$('#fine-uploader-manual-trigger').fineUploader({
        autoUpload: false,
        multiple: true,
        template: 'qq-template-manual-trigger',
        session: {
          endpoint: (URL + "?table=" + this.table + "&fk=" + this.fk + "&pk=" + this.pk + "&filterID=" + this.filterID) + (fieldDir != null ? "&fieldDir=" + fieldDir : "")
        },
        deleteFile: {
          enabled: true,
          endpoint: URL + "deleteFile",
          method: 'POST',
          params: {
            table: this.table,
            fieldDir: fieldDir != null ? fieldDir : void 0
          }
        },
        request: {
          endpoint: URL + "upload",
          params: {
            fk: this.fk,
            id: this.filterID,
            table: this.table
          }
        },
        thumbnails: {
          placeholders: {
            waitingPath: baseUrl + '/lib/fine-uploader/placeholders/waiting-generic.png',
            notAvailablePath: baseUrl + '/lib/fine-uploader/placeholders/not_available-generic.png'
          }
        },
        callbacks: {
          onError: function(id, name, errorReason, xhr) {
            return alert(JSON.parse(xhr.response).error);
          },
          onSessionRequestComplete: (function(_this) {
            return function() {};
          })(this)
        }
      });
      this.$('#trigger-upload').click((function(_this) {
        return function() {
          return _this.$('#fine-uploader-manual-trigger').fineUploader('uploadStoredFiles');
        };
      })(this));
      return this.activeSortFiles();
    };

    AutoCrudView.prototype.activeSortFiles = function() {
      var $uploadList;
      $uploadList = this.$('.qq-upload-list');
      $uploadList.sortable({
        axis: "y"
      });
      return $uploadList.disableSelection();
    };

    AutoCrudView.prototype.checkForFilesTable = function() {
      return _.find(this.tableInfos, (function(_this) {
        return function(value, index) {
          return value.name === 'uuid';
        };
      })(this));
    };

    AutoCrudView.prototype.getFieldDirectory = function(data) {
      var dirField;
      dirField = '';
      _.map(data.attributes, (function(_this) {
        return function(value, field) {
          if (_this.isFileDirectory(value)) {
            return dirField = field;
          }
        };
      })(this));
      return dirField;
    };

    AutoCrudView.prototype.isFileDirectory = function(string) {
      var regex;
      regex = new RegExp('uploads/', 'ig');
      return regex.test(string);
    };

    AutoCrudView.prototype.interactExcBtn = function(models) {
      var $btn;
      _.each(models, (function(_this) {
        return function(model) {
          if (model.get('checked')) {
            return _this.checkedModels.add(model);
          } else {
            return _this.checkedModels.remove(model);
          }
        };
      })(this));
      $btn = this.$('#deleteData');
      if (this.checkedModels.models.length) {
        $btn.show();
        return $btn.find('#qntSelectedItens').html(this.checkedModels.models.length);
      } else {
        return $btn.hide();
      }
    };

    AutoCrudView.prototype.updateRegCounter = function(collection) {
      if (!this.editing) {
        if (this.crudTableView != null) {
          this.crudTableView.addLinha(_.last(collection.models));
          this.crudTableView.ellipsisTableData();
        }
        return this.$('#qtdDados').html(this.collection.models.length);
      }
    };

    AutoCrudView.prototype.backGrid = function() {
      var route;
      this.resetGridStatus();
      if (!this.configSite) {
        if (this.fk != null) {
          route = "admin/autoCrud/" + this.parentTable + "/related/" + this.table + "/" + this.fk + "/" + this.filterID;
        } else {
          route = "admin/autoCrud/" + this.table;
        }
        Router.navigate(route, {
          trigger: false
        });
        this.filterID = null;
        this.renderTable();
        this.$('#deleteDataEdit').hide();
        if (_.any(this.checkedModels.models)) {
          this.$('#deleteData').show();
        }
      } else {
        window.location.hash = "admin";
      }
      return this.defFetchData.resolve();
    };

    AutoCrudView.prototype.deleteDataEdit = function() {
      if (window.confirm("Deseja realmente excluir o registro #" + (this.editData.model.get(this.pk)) + "? Todos os dados relacionados serão excluídos também.")) {
        this.deletarDado([this.editData.model]);
        return this.backGrid();
      }
    };

    AutoCrudView.prototype.nextScrollPage = function(page) {
      var $wrapper;
      this.tableLoader('show');
      $wrapper = this.$("#dataTableContent").children('.table-responsive');
      this.paginationControls.requisicaoAtiva = true;
      this.paginationControls.paginaAtual++;
      this.ultimaPosicaoScroll = $wrapper.scrollTop();
      return $.when(this.defFetchData).done((function(_this) {
        return function() {
          if (_this.fetchData != null) {
            _this.fetchData.pagina = page;
          } else {
            _this.fetchData = {
              table: _this.table,
              pagina: 1
            };
          }
          return $.when(_this.getDataPage()).done(function() {
            _this.paginationControls.requisicaoAtiva = false;
            return _this.tableLoader('hide');
          });
        };
      })(this));
    };

    AutoCrudView.prototype.scroll = function() {
      var $table, $wrapperScroll;
      if (!this.paginationControls.limiteBuscaAtingido && !this.paginationControls.requisicaoAtiva) {
        $wrapperScroll = this.$('#dataTableContent > .table-responsive');
        $table = this.$(".dadosTable");

        /* Condição para buscar
        				Quando scroll chegar a 50px do final
         */
        if (($wrapperScroll.scrollTop() + $wrapperScroll.height()) >= ($table.height() - 50)) {
          return this.nextScrollPage(this.paginationControls.paginaAtual);
        }
      }
    };

    AutoCrudView.prototype.resetGridStatus = function() {
      this.edit = false;
      this.newData = null;
      return this.resetPaginationControls();
    };

    AutoCrudView.prototype.addOrder = function(model) {
      return Ordenator.addOrder({
        model: model,
        table: this.table,
        pk: this.pk
      });
    };

    AutoCrudView.prototype.subOrder = function(model) {
      return Ordenator.subOrder({
        model: model,
        table: this.table,
        pk: this.pk
      });
    };

    AutoCrudView.prototype.dragFile = function(e, ui) {
      var totalPos;
      totalPos = this.$('.qq-upload-list').children().length;
      return _.each(this.$('.qq-upload-list > li'), (function(_this) {
        return function(fileLI, i) {
          var $fileLI, actualPos, fileIdx;
          $fileLI = $(fileLI);
          fileIdx = $fileLI.attr('qq-file-id');
          actualPos = totalPos - i;
          return Ordenator.setOrder({
            model: _this.collection.at(fileIdx),
            table: _this.table,
            pk: _this.pk,
            ordem: actualPos
          });
        };
      })(this));
    };

    AutoCrudView.prototype.openFile = function(e) {
      var $target, fieldDir, idx, model;
      if (this.edit) {
        fieldDir = this.getFieldDirectory(this.editModel);
        return window.open(this.editModel.get(fieldDir), 'blank');
      } else {
        $target = $(e.target);
        idx = $target.closest('li').attr('qq-file-id');
        model = this.collection.at(idx);
        return window.open(model.get(this.getFieldDirectory(model)), 'blank');
      }
    };

    return AutoCrudView;

  })(Backbone.View);
});
