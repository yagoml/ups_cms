var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(['jquery', 'underscore', 'backbone', ENV + "/js/router", ENV + "/js/components/windowPopup", ENV + "/js/components/loader", "text!src/templates/components/autoCrud/EditDataTpl.html", "text!src/templates/components/upload/upload.html", "lib/ckeditor/ckeditor"], function($, _, Backbone, Router, WindowPopup, Loader, EditDataTpl, UploadTpl) {
  var EditData, mediaCharsWidth;
  mediaCharsWidth = 7.058252427184466;
  return EditData = (function(superClass) {
    extend(EditData, superClass);

    function EditData() {
      return EditData.__super__.constructor.apply(this, arguments);
    }

    EditData.prototype.className = 'auto-crud-edit-data';

    EditData.prototype.template = _.template(EditDataTpl);

    EditData.prototype.events = {
      'submit #editDataForm': 'prepareToSave'
    };

    EditData.prototype.initialize = function(options) {
      var ref;
      this.options = options;
      ref = this.options, this.model = ref.model, this.table = ref.table, this.tableInfos = ref.tableInfos, this.tableFks = ref.tableFks, this.tableTitles = ref.tableTitles, this.systemFields = ref.systemFields, this.inputTypes = ref.inputTypes, this.fks = ref.fks, this.refTables = ref.refTables, this.fk = ref.fk, this.filterID = ref.filterID, this.configSite = ref.configSite;
      this.options.pk = (_.findWhere(this.tableInfos, {
        primary_key: 1
      })).name;
      return this.pk = this.options.pk;
    };

    EditData.prototype.render = function() {
      this.$el.html(this.template(this.options));
      return this;
    };

    EditData.prototype.afterRender = function() {
      var charsPerLine, fields, hasUpload;
      charsPerLine = this.getCharsPerLine();
      fields = '';
      hasUpload = false;
      if (_.any(this.refTables)) {
        this.$('#relatedData').html(this.createRefLinks());
      } else {
        this.$("#relatedData").parent().hide();
      }
      _.each(this.tableInfos, (function(_this) {
        return function(tabInfo) {
          var dataLen, fieldData, fieldName, isFk, isSystemField, ref;
          fieldName = ((ref = _.findWhere(_this.tableTitles, {
            campo: tabInfo.name
          })) != null ? ref.nome : void 0) || capitalize(tabInfo.name.replace(/(?![a-zA-Z0-9])./g, ' '));
          isSystemField = _this.systemFields.includes(tabInfo.name);
          if (!tabInfo.primary_key) {
            isFk = _.findWhere(_this.fks, {
              COLUMN_NAME: tabInfo.name
            });
            if (!isFk) {
              fieldData = _this.model.get(tabInfo.name);
              dataLen = fieldData != null ? fieldData.length : void 0;
              fields += "<div class='form-box-edit' style=' " + (tabInfo.type === 'text' || tabInfo.type === 'varchar' ? 'width: 100%;' : 'width: fit-content; margin-right: 15px;') + " " + (isSystemField ? 'display: none;' : void 0) + " '><label>" + fieldName + "</label>";
              if (tabInfo.type !== 'text' && tabInfo.type !== 'varchar') {
                fields += "<input type='" + _this.inputTypes[tabInfo.type] + "' id='" + tabInfo.name + "' name='" + tabInfo.name + "' class='form-control' value='" + (fieldData != null ? fieldData : '') + "'>";
              } else {
                if (_this.isFileDirectory(fieldData)) {
                  hasUpload = true;
                  fields += '<div class="fn-upload"></div>';
                } else {
                  fields += "<textarea class='form-control' id='" + tabInfo.name + "' name='" + tabInfo.name + "' rows='" + (dataLen != null ? Math.ceil(dataLen / charsPerLine) : 1) + "'>" + (fieldData != null ? fieldData : '') + "</textarea>";
                }
              }
              return fields += '</div>';
            }
          }
        };
      })(this));
      this.$('.form-body').html(fields);
      if (hasUpload) {
        this.filesUpload();
      }
      return _.each(this.$('textarea'), (function(_this) {
        return function(textArea) {
          var textAreaName;
          textAreaName = $(textArea).attr('name');
          if ((_.findWhere(_this.tableInfos, {
            name: textAreaName
          })).type !== 'varchar' && !_this.configSite) {
            return CKEDITOR.replace(textAreaName);
          }
        };
      })(this));
    };

    EditData.prototype.prepareToSave = function(e) {
      var data;
      e.stopPropagation();
      e.preventDefault();
      data = this.getFormData();
      return this.save(data);
    };

    EditData.prototype.save = function(data) {
      var id;
      id = this.model.get(this.pk);
      return $.ajax({
        type: 'post',
        dataType: 'json',
        url: baseUrl + "dados/saveData",
        data: {
          data: data,
          table: this.table,
          pk: this.pk,
          id: id != null ? id : void 0,
          fk: this.fk != null ? this.fk : void 0,
          filterID: this.filterID != null ? this.filterID : void 0
        },
        beforeSend: (function(_this) {
          return function() {
            return _this.disableBtn();
          };
        })(this),
        success: (function(_this) {
          return function(savedData) {
            _this.enableBtn();
            if (!_.isEmpty(_this.model.attributes)) {
              _this.model.set(data);
            } else {
              _this.model.set(savedData);
            }
            if (!_this.configSite) {
              return _this.trigger('backFromEdit', _this.model);
            }
          };
        })(this)
      });
    };

    EditData.prototype.getFormData = function() {
      var data;
      data = {};
      _.each(this.tableInfos, (function(_this) {
        return function(tabInfo) {
          var value;
          value = _this.$("#" + tabInfo.name).val();
          if ((value != null) && _.any(value)) {
            return data[tabInfo.name] = value;
          }
        };
      })(this));
      return data;
    };

    EditData.prototype.disableBtn = function() {
      this.$('#saveData').attr('disabled', true);
      return this.$('#saveData').prepend((new Loader({
        "class": 'pLoader'
      })).show());
    };

    EditData.prototype.enableBtn = function() {
      this.$('#saveData').attr('disabled', false);
      return this.$('#saveData').find('.loader-wrapper').remove();
    };

    EditData.prototype.getCharsPerLine = function() {
      return this.$('.auto-crud-form-edit').width() / mediaCharsWidth;
    };

    EditData.prototype.isFileDirectory = function(string) {
      var regex;
      regex = new RegExp('uploads/', 'ig');
      return regex.test(string);
    };

    EditData.prototype.createRefLinks = function() {
      var relatedLinks;
      relatedLinks = '';
      _.each(this.refTables, (function(_this) {
        return function(refTable) {
          return relatedLinks += "<a href='#admin/autoCrud/" + _this.table + "/related/" + (refTable.TABLE_NAME + '/' + refTable.COLUMN_NAME + '/' + _this.model.get(_this.pk)) + "' class='col-xs-12 margB10'> " + (capitalize(refTable.TABLE_NAME.replace(/(?![a-zA-Z0-9])./g, ' '))) + " </a>";
        };
      })(this));
      return relatedLinks;
    };

    EditData.prototype.filesUpload = function() {
      var fieldDir, modelID;
      this.$('.fn-upload').html(UploadTpl);
      fieldDir = this.getFieldDirectory(this.model);
      modelID = this.model.get(this.pk);
      this.$('#fine-uploader-manual-trigger').fineUploader({
        autoUpload: false,
        multiple: false,
        template: 'qq-template-manual-trigger',
        session: {
          endpoint: (baseUrl + "dados/singleFile?table=" + this.table + "&pk=" + this.pk + "&filterID=" + modelID) + (fieldDir != null ? "&fieldDir=" + fieldDir : "")
        },
        deleteFile: {
          enabled: true,
          endpoint: baseUrl + "dados/deleteFile",
          method: 'POST',
          params: {
            table: 'uploaded_single_files',
            fieldDir: fieldDir != null ? fieldDir : void 0,
            singleFile: true,
            parentTable: this.table,
            parentPK: this.pk,
            id: modelID
          }
        },
        request: {
          endpoint: baseUrl + "dados/upload",
          params: {
            fk: 'id_registro',
            id: modelID,
            table: 'uploaded_single_files',
            singleFile: true,
            parentTable: this.table,
            parentPK: this.pk,
            fieldDir: fieldDir
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
          }
        }
      });
      return this.$('#trigger-upload').click((function(_this) {
        return function() {
          return _this.$('#fine-uploader-manual-trigger').fineUploader('uploadStoredFiles');
        };
      })(this));
    };

    EditData.prototype.getFieldDirectory = function(data) {
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

    return EditData;

  })(Backbone.View);
});
