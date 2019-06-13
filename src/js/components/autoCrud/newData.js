var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "underscore", "backbone", ENV + "/js/components/loader", ENV + "/js/components/autoCrud/editData", "text!src/templates/components/autoCrud/newDataTpl.html", "text!src/templates/components/upload/upload.html"], function($, _, Backbone, Loader, EditData, NewDataTpl, UploadTpl) {
  var WindowNewDado;
  return WindowNewDado = (function(superClass) {
    extend(WindowNewDado, superClass);

    function WindowNewDado() {
      return WindowNewDado.__super__.constructor.apply(this, arguments);
    }

    WindowNewDado.prototype.template = _.template(NewDataTpl);

    WindowNewDado.prototype.events = {
      'submit #newDataForm': 'prepareToSave'
    };

    WindowNewDado.prototype.afterRender = function() {
      var charsPerLine, fields, hasUpload;
      charsPerLine = this.getCharsPerLine();
      fields = '';
      hasUpload = false;
      _.each(this.tableInfos, (function(_this) {
        return function(tabInfo, i) {
          var fieldName, isFk, isSystemField, ref;
          if (!_this.isFileDirectory(tabInfo["default"])) {
            fieldName = ((ref = _.findWhere(_this.tableTitles, {
              campo: tabInfo.name
            })) != null ? ref.nome : void 0) || tabInfo.name;
            isSystemField = _this.systemFields.includes(tabInfo.name);
            if (!tabInfo.primary_key && !isSystemField) {
              isFk = _.findWhere(_this.fks, {
                COLUMN_NAME: tabInfo.name
              });
              if (!isFk) {
                fields += "<div class='form-box-edit' style=' " + (tabInfo.type === 'text' || tabInfo.type === 'varchar' ? 'width: 100%;' : 'width: fit-content; margin-right: 15px;') + " '><label>" + fieldName + "</label>";
                if (tabInfo.type !== 'text' && tabInfo.type !== 'varchar') {
                  fields += "<input type='" + _this.inputTypes[tabInfo.type] + "' id='" + tabInfo.name + "' name='" + tabInfo.name + "' class='form-control'>";
                } else {
                  fields += "<textarea class='form-control' id='" + tabInfo.name + "' name='" + tabInfo.name + "' rows='" + (typeof dataLen !== "undefined" && dataLen !== null ? Math.ceil(dataLen / charsPerLine) : tabInfo.type === 'text' ? 3 : 1) + "'></textarea>";
                }
                return fields += '</div>';
              }
            }
          }
        };
      })(this));
      this.$('.form-body').html(fields);
      if (hasUpload) {
        return this.filesUpload();
      }
    };

    WindowNewDado.prototype.filesUpload = function() {
      var fieldDir, modelID;
      this.$('.fn-upload').html(UploadTpl);
      fieldDir = this.getFieldDirectory(this.model);
      modelID = this.model.get(this.options.pk);
      this.$('#fine-uploader-manual-trigger').fineUploader({
        autoUpload: false,
        multiple: false,
        template: 'qq-template-manual-trigger',
        deleteFile: {
          enabled: true,
          endpoint: baseUrl + "dados/deleteFile",
          method: 'POST',
          params: {
            table: 'uploaded_single_files',
            fieldDir: fieldDir != null ? fieldDir : void 0,
            singleFile: true,
            parentTable: this.table,
            parentPK: this.options.pk,
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
            parentPK: this.options.pk,
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

    return WindowNewDado;

  })(EditData);
});
