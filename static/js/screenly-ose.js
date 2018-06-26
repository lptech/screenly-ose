// Generated by CoffeeScript 1.9.3

/* screenly-ose ui */

(function() {
  var API, AddAssetView, App, Asset, AssetRowView, Assets, AssetsView, EditAssetView, date_settings, date_settings_12hour, date_settings_24hour, date_to, delay, domains, get_filename, get_mimetype, get_template, insertWbr, mimetypes, now, url_test, viduris,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  $().ready(function() {
    var hide_popover, popover_shown, show_popover;
    popover_shown = false;
    hide_popover = function() {
      $('#subsribe-form-container').html('');
      popover_shown = false;
      $(window).off('keyup.email_popover');
      return $(window).off('click.email_popover');
    };
    show_popover = function() {
      $('#subsribe-form-container').html($('#subscribe-form-template').html());
      popover_shown = true;
      $(window).on('keyup.email_popover', function(event) {
        if (event.keyCode === 27) {
          return hide_popover();
        }
      });
      return $(window).on('click.email_popover', function(event) {
        var pop;
        pop = document.getElementById('subscribe-popover');
        if (!$.contains(pop, event.target)) {
          return hide_popover();
        }
      });
    };
    return $('#show-email-popover').click(function() {
      if (!popover_shown) {
        show_popover();
      }
      return false;
    });
  });

  API = (window.Screenly || (window.Screenly = {}));

  date_settings_12hour = {
    full_date: 'MM/DD/YYYY hh:mm:ss A',
    date: 'MM/DD/YYYY',
    time: 'hh:mm A',
    show_meridian: true,
    date_picker_format: 'mm/dd/yyyy'
  };

  date_settings_24hour = {
    full_date: 'MM/DD/YYYY HH:mm:ss',
    date: 'MM/DD/YYYY',
    time: 'HH:mm',
    show_meridian: false,
    datepicker_format: 'mm/dd/yyyy'
  };

  date_settings = use_24_hour_clock ? date_settings_24hour : date_settings_12hour;

  API.date_to = date_to = function(d) {
    var dd;
    dd = moment.utc(d).local();
    return {
      string: function() {
        return dd.format(date_settings.full_date);
      },
      date: function() {
        return dd.format(date_settings.date);
      },
      time: function() {
        return dd.format(date_settings.time);
      }
    };
  };

  now = function() {
    return new Date();
  };

  get_template = function(name) {
    return _.template(($("#" + name + "-template")).html());
  };

  delay = function(wait, fn) {
    return _.delay(fn, wait);
  };

  mimetypes = [['jpg jpeg png pnm gif bmp'.split(' '), 'image'], ['avi mkv mov mpg mpeg mp4 ts flv'.split(' '), 'video']];

  viduris = 'rtsp rtmp'.split(' ');

  domains = [['www.youtube.com youtu.be'.split(' '), 'youtube_asset']];

  get_mimetype = (function(_this) {
    return function(filename) {
      var domain, ext, match, mt, scheme;
      scheme = (_.first(filename.split(':'))).toLowerCase();
      match = indexOf.call(viduris, scheme) >= 0;
      if (match) {
        return 'streaming';
      }
      domain = _.first(((_.last(filename.split('//'))).toLowerCase()).split('/'));
      mt = _.find(domains, function(mt) {
        return indexOf.call(mt[0], domain) >= 0;
      });
      if (mt && indexOf.call(mt[0], domain) >= 0) {
        return mt[1];
      }
      ext = (_.last(filename.split('.'))).toLowerCase();
      mt = _.find(mimetypes, function(mt) {
        return indexOf.call(mt[0], ext) >= 0;
      });
      if (mt) {
        return mt[1];
      } else {
        return null;
      }
    };
  })(this);

  url_test = function(v) {
    return /(http|https|rtsp|rtmp):\/\/[\w-]+(\.?[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(v);
  };

  get_filename = function(v) {
    return (v.replace(/[\/\\\s]+$/g, '')).replace(/^.*[\\\/]/g, '');
  };

  insertWbr = function(v) {
    return (v.replace(/\//g, '/<wbr>')).replace(/\&/g, '&amp;<wbr>');
  };

  Backbone.emulateJSON = false;

  API.Asset = Asset = (function(superClass) {
    extend(Asset, superClass);

    function Asset() {
      this.old_name = bind(this.old_name, this);
      this.rollback = bind(this.rollback, this);
      this.backup = bind(this.backup, this);
      this.active = bind(this.active, this);
      this.defaults = bind(this.defaults, this);
      return Asset.__super__.constructor.apply(this, arguments);
    }

    Asset.prototype.idAttribute = "asset_id";

    Asset.prototype.fields = 'name mimetype uri start_date end_date duration'.split(' ');

    Asset.prototype.defaults = function() {
      return {
        name: '',
        mimetype: 'webpage',
        uri: '',
        is_active: 1,
        start_date: '',
        end_date: '',
        duration: default_duration,
        is_enabled: 0,
        is_processing: 0,
        nocache: 0,
        play_order: 0
      };
    };

    Asset.prototype.active = function() {
      var at, end_date, start_date;
      if (this.get('is_enabled') && this.get('start_date') && this.get('end_date')) {
        at = now();
        start_date = new Date(this.get('start_date'));
        end_date = new Date(this.get('end_date'));
        return (start_date <= at && at <= end_date);
      } else {
        return false;
      }
    };

    Asset.prototype.backup = function() {
      return this.backup_attributes = this.toJSON();
    };

    Asset.prototype.rollback = function() {
      if (this.backup_attributes) {
        this.set(this.backup_attributes);
        return this.backup_attributes = void 0;
      }
    };

    Asset.prototype.old_name = function() {
      if (this.backup_attributes) {
        return this.backup_attributes.name;
      }
    };

    return Asset;

  })(Backbone.Model);

  API.Assets = Assets = (function(superClass) {
    extend(Assets, superClass);

    function Assets() {
      return Assets.__super__.constructor.apply(this, arguments);
    }

    Assets.prototype.url = "/api/v1.2/assets";

    Assets.prototype.model = Asset;

    Assets.prototype.comparator = 'play_order';

    return Assets;

  })(Backbone.Collection);

  API.View = {};

  API.View.AddAssetView = AddAssetView = (function(superClass) {
    extend(AddAssetView, superClass);

    function AddAssetView() {
      this.destroyFileUploadWidget = bind(this.destroyFileUploadWidget, this);
      this.cancel = bind(this.cancel, this);
      this.validate = bind(this.validate, this);
      this.change = bind(this.change, this);
      this.updateMimetype = bind(this.updateMimetype, this);
      this.updateFileUploadMimetype = bind(this.updateFileUploadMimetype, this);
      this.updateUriMimetype = bind(this.updateUriMimetype, this);
      this.clickTabNavUri = bind(this.clickTabNavUri, this);
      this.clickTabNavUpload = bind(this.clickTabNavUpload, this);
      this.change_mimetype = bind(this.change_mimetype, this);
      this.save = bind(this.save, this);
      this.viewmodel = bind(this.viewmodel, this);
      this.initialize = bind(this.initialize, this);
      this.$fv = bind(this.$fv, this);
      this.$f = bind(this.$f, this);
      return AddAssetView.__super__.constructor.apply(this, arguments);
    }

    AddAssetView.prototype.$f = function(field) {
      return this.$("[name='" + field + "']");
    };

    AddAssetView.prototype.$fv = function() {
      var field, ref, val;
      field = arguments[0], val = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.$f(field)).val.apply(ref, val);
    };

    AddAssetView.prototype.initialize = function(oprions) {
      var d, deadline, deadlines, tag;
      ($('body')).append(this.$el.html(get_template('asset-modal')));
      (this.$el.children(":first")).modal();
      (this.$('.cancel')).val('Back to Assets');
      deadlines = {
        start: now(),
        end: (moment().add('days', 7)).toDate()
      };
      for (tag in deadlines) {
        if (!hasProp.call(deadlines, tag)) continue;
        deadline = deadlines[tag];
        d = date_to(deadline);
        this.$fv(tag + "_date_date", d.date());
        this.$fv(tag + "_date_time", d.time());
      }
      return false;
    };

    AddAssetView.prototype.viewmodel = function(model) {
      var field, k, l, len, len1, ref, ref1, results, which;
      ref = ['start', 'end'];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        this.$fv(which + "_date", (new Date((this.$fv(which + "_date_date")) + " " + (this.$fv(which + "_date_time")))).toISOString());
      }
      ref1 = model.fields;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        field = ref1[l];
        if (!(this.$f(field)).prop('disabled')) {
          results.push(model.set(field, this.$fv(field), {
            silent: true
          }));
        }
      }
      return results;
    };

    AddAssetView.prototype.events = {
      'change': 'change',
      'click #save-asset': 'save',
      'click .cancel': 'cancel',
      'hidden.bs.modal': 'destroyFileUploadWidget',
      'click .tabnav-uri': 'clickTabNavUri',
      'click .tabnav-file_upload': 'clickTabNavUpload'
    };

    AddAssetView.prototype.save = function(e) {
      var model, save;
      if ((this.$fv('uri')) === '') {
        return false;
      }
      if ((this.$('#tab-uri')).hasClass('active')) {
        model = new Asset({}, {
          collection: API.assets
        });
        this.$fv('mimetype', '');
        this.updateUriMimetype();
        this.viewmodel(model);
        model.set({
          name: model.get('uri')
        }, {
          silent: true
        });
        save = model.save();
        (this.$('input')).prop('disabled', true);
        save.done((function(_this) {
          return function(data) {
            model.id = data.asset_id;
            (_this.$el.children(":first")).modal('hide');
            _.extend(model.attributes, data);
            return model.collection.add(model);
          };
        })(this));
        save.fail((function(_this) {
          return function() {
            (_this.$('input')).prop('disable', false);
            return model.destroy();
          };
        })(this));
      }
      return false;
    };

    AddAssetView.prototype.change_mimetype = function() {
      if ((this.$fv('mimetype')) === "video") {
        return this.$fv('duration', 0);
      } else if ((this.$fv('mimetype')) === "streaming") {
        return this.$fv('duration', default_streaming_duration);
      } else {
        return this.$fv('duration', default_duration);
      }
    };

    AddAssetView.prototype.clickTabNavUpload = function(e) {
      var that;
      if (!(this.$('#tab-file_upload')).hasClass('active')) {
        (this.$('ul.nav-tabs li')).removeClass('active');
        (this.$('.tab-pane')).removeClass('active');
        (this.$('.tabnav-file_upload')).addClass('active');
        (this.$('#tab-file_upload')).addClass('active');
        (this.$('.uri')).hide();
        (this.$('#save-asset')).hide();
        that = this;
        (this.$("[name='file_upload']")).fileupload({
          autoUpload: false,
          sequentialUploads: true,
          maxChunkSize: 5000000,
          url: 'api/v1/file_asset',
          progressall: (function(_this) {
            return function(e, data) {
              if (data.loaded && data.total) {
                return (_this.$('.progress .bar')).css('width', (data.loaded / data.total * 100) + "%");
              }
            };
          })(this),
          add: function(e, data) {
            var filename, model;
            (that.$('.status')).hide();
            (that.$('.progress')).show();
            model = new Asset({}, {
              collection: API.assets
            });
            filename = data['files'][0]['name'];
            that.$fv('name', filename);
            that.updateFileUploadMimetype(filename);
            that.viewmodel(model);
            return data.submit().success((function(_this) {
              return function(uri) {
                var save;
                model.set({
                  uri: uri
                }, {
                  silent: true
                });
                save = model.save();
                save.done(function(data) {
                  model.id = data.asset_id;
                  _.extend(model.attributes, data);
                  return model.collection.add(model);
                });
                return save.fail(function() {
                  return model.destroy();
                });
              };
            })(this)).error((function(_this) {
              return function() {
                return model.destroy();
              };
            })(this));
          },
          stop: function(e) {
            (that.$('.progress')).hide();
            (that.$('.progress .bar')).css('width', "0");
            (that.$('.status')).show();
            return (that.$('.status')).html('Upload completed.');
          }
        });
      }
      return false;
    };

    AddAssetView.prototype.clickTabNavUri = function(e) {
      if (!(this.$('#tab-uri')).hasClass('active')) {
        (this.$("[name='file_upload']")).fileupload('destroy');
        (this.$('ul.nav-tabs li')).removeClass('active');
        (this.$('.tab-pane')).removeClass('active');
        (this.$('.tabnav-uri')).addClass('active');
        (this.$('#tab-uri')).addClass('active');
        (this.$('#save-asset')).show();
        (this.$('.uri')).show();
        return (this.$f('uri')).focus();
      }
    };

    AddAssetView.prototype.updateUriMimetype = function() {
      return this.updateMimetype(this.$fv('uri'));
    };

    AddAssetView.prototype.updateFileUploadMimetype = function(filename) {
      return this.updateMimetype(filename);
    };

    AddAssetView.prototype.updateMimetype = function(filename) {
      var mt;
      mt = get_mimetype(filename);
      if (mt) {
        this.$fv('mimetype', mt);
      }
      return this.change_mimetype();
    };

    AddAssetView.prototype.change = function(e) {
      this._change || (this._change = _.throttle(((function(_this) {
        return function() {
          _this.validate();
          return true;
        };
      })(this)), 500));
      return this._change.apply(this, arguments);
    };

    AddAssetView.prototype.validate = function(e) {
      var errors, field, fn, k, len, ref, results, that, v, validators;
      that = this;
      validators = {
        uri: (function(_this) {
          return function(v) {
            if (((that.$('#tab-uri')).hasClass('active')) && !url_test(v)) {
              return 'please enter a valid URL';
            }
          };
        })(this)
      };
      errors = (function() {
        var results;
        results = [];
        for (field in validators) {
          fn = validators[field];
          if (v = fn(this.$fv(field))) {
            results.push([field, v]);
          }
        }
        return results;
      }).call(this);
      (this.$(".control-group.warning .help-inline.warning")).remove();
      (this.$(".control-group")).removeClass('warning');
      (this.$('[type=submit]')).prop('disabled', false);
      results = [];
      for (k = 0, len = errors.length; k < len; k++) {
        ref = errors[k], field = ref[0], v = ref[1];
        (this.$('[type=submit]')).prop('disabled', true);
        (this.$(".control-group." + field)).addClass('warning');
        results.push((this.$(".control-group." + field + " .controls")).append($("<span class='help-inline warning'>" + v + "</span>")));
      }
      return results;
    };

    AddAssetView.prototype.cancel = function(e) {
      return (this.$el.children(":first")).modal('hide');
    };

    AddAssetView.prototype.destroyFileUploadWidget = function(e) {
      if ((this.$('#tab-file_upload')).hasClass('active')) {
        return (this.$("[name='file_upload']")).fileupload('destroy');
      }
    };

    return AddAssetView;

  })(Backbone.View);

  API.View.EditAssetView = EditAssetView = (function(superClass) {
    extend(EditAssetView, superClass);

    function EditAssetView() {
      this.displayAdvanced = bind(this.displayAdvanced, this);
      this.toggleAdvanced = bind(this.toggleAdvanced, this);
      this.cancel = bind(this.cancel, this);
      this.validate = bind(this.validate, this);
      this.change = bind(this.change, this);
      this.save = bind(this.save, this);
      this.viewmodel = bind(this.viewmodel, this);
      this.render = bind(this.render, this);
      this.initialize = bind(this.initialize, this);
      this.$fv = bind(this.$fv, this);
      this.$f = bind(this.$f, this);
      return EditAssetView.__super__.constructor.apply(this, arguments);
    }

    EditAssetView.prototype.$f = function(field) {
      return this.$("[name='" + field + "']");
    };

    EditAssetView.prototype.$fv = function() {
      var field, ref, val;
      field = arguments[0], val = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.$f(field)).val.apply(ref, val);
    };

    EditAssetView.prototype.initialize = function(options) {
      ($('body')).append(this.$el.html(get_template('asset-modal')));
      (this.$('input.time')).timepicker({
        minuteStep: 5,
        showInputs: true,
        disableFocus: true,
        showMeridian: date_settings.show_meridian
      });
      (this.$('input[name="nocache"]')).prop('checked', this.model.get('nocache'));
      (this.$('.modal-header .close')).remove();
      (this.$el.children(":first")).modal();
      this.model.backup();
      this.model.bind('change', this.render);
      this.render();
      this.validate();
      return false;
    };

    EditAssetView.prototype.render = function() {
      var d, f, field, k, l, len, len1, len2, m, ref, ref1, ref2, which;
      this.undelegateEvents();
      ref = 'mimetype uri file_upload'.split(' ');
      for (k = 0, len = ref.length; k < len; k++) {
        f = ref[k];
        (this.$(f)).attr('disabled', true);
      }
      (this.$('#modalLabel')).text("Edit Asset");
      (this.$('.asset-location')).hide();
      (this.$('.uri')).hide();
      (this.$('.asset-location.edit')).show();
      (this.$('.mime-select')).prop('disabled', 'true');
      if ((this.model.get('mimetype')) === 'video') {
        (this.$f('duration')).prop('disabled', true);
      }
      ref1 = this.model.fields;
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        field = ref1[l];
        if ((this.$fv(field)) !== this.model.get(field)) {
          this.$fv(field, this.model.get(field));
        }
      }
      (this.$('.uri-text')).html(insertWbr(this.model.get('uri')));
      ref2 = ['start', 'end'];
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        which = ref2[m];
        d = date_to(this.model.get(which + "_date"));
        this.$fv(which + "_date_date", d.date());
        (this.$f(which + "_date_date")).datepicker({
          autoclose: true,
          format: date_settings.datepicker_format
        });
        (this.$f(which + "_date_date")).datepicker('setValue', d.date());
        this.$fv(which + "_date_time", d.time());
      }
      this.displayAdvanced();
      this.delegateEvents();
      return false;
    };

    EditAssetView.prototype.viewmodel = function() {
      var field, k, l, len, len1, ref, ref1, results, which;
      ref = ['start', 'end'];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        this.$fv(which + "_date", (new Date((this.$fv(which + "_date_date")) + " " + (this.$fv(which + "_date_time")))).toISOString());
      }
      ref1 = this.model.fields;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        field = ref1[l];
        if (!(this.$f(field)).prop('disabled')) {
          results.push(this.model.set(field, this.$fv(field), {
            silent: true
          }));
        }
      }
      return results;
    };

    EditAssetView.prototype.events = {
      'click #save-asset': 'save',
      'click .cancel': 'cancel',
      'change': 'change',
      'keyup': 'change',
      'click .advanced-toggle': 'toggleAdvanced'
    };

    EditAssetView.prototype.save = function(e) {
      var save;
      this.viewmodel();
      save = null;
      this.model.set('nocache', (this.$('input[name="nocache"]')).prop('checked') ? 1 : 0);
      if (!this.model.get('name')) {
        if (this.model.old_name()) {
          this.model.set({
            name: this.model.old_name()
          }, {
            silent: true
          });
        } else if (get_mimetype(this.model.get('uri'))) {
          this.model.set({
            name: get_filename(this.model.get('uri'))
          }, {
            silent: true
          });
        } else {
          this.model.set({
            name: this.model.get('uri')
          }, {
            silent: true
          });
        }
      }
      save = this.model.save();
      (this.$('input, select')).prop('disabled', true);
      save.done((function(_this) {
        return function(data) {
          _this.model.id = data.asset_id;
          if (!_this.model.collection) {
            _this.collection.add(_this.model);
          }
          (_this.$el.children(":first")).modal('hide');
          return _.extend(_this.model.attributes, data);
        };
      })(this));
      save.fail((function(_this) {
        return function() {
          (_this.$('.progress')).hide();
          return (_this.$('input, select')).prop('disabled', false);
        };
      })(this));
      return false;
    };

    EditAssetView.prototype.change = function(e) {
      this._change || (this._change = _.throttle(((function(_this) {
        return function() {
          _this.viewmodel();
          _this.model.trigger('change');
          _this.validate();
          return true;
        };
      })(this)), 500));
      return this._change.apply(this, arguments);
    };

    EditAssetView.prototype.validate = function(e) {
      var errors, field, fn, k, len, ref, results, that, v, validators;
      that = this;
      validators = {
        duration: (function(_this) {
          return function(v) {
            if (('video' !== _this.model.get('mimetype')) && (!(_.isNumber(v * 1)) || v * 1 < 1)) {
              return 'please enter a valid number';
            }
          };
        })(this),
        end_date: (function(_this) {
          return function(v) {
            if (!((new Date(_this.$fv('start_date'))) < (new Date(_this.$fv('end_date'))))) {
              return 'end date should be after start date';
            }
          };
        })(this)
      };
      errors = (function() {
        var results;
        results = [];
        for (field in validators) {
          fn = validators[field];
          if (v = fn(this.$fv(field))) {
            results.push([field, v]);
          }
        }
        return results;
      }).call(this);
      (this.$(".control-group.warning .help-inline.warning")).remove();
      (this.$(".control-group")).removeClass('warning');
      (this.$('[type=submit]')).prop('disabled', false);
      results = [];
      for (k = 0, len = errors.length; k < len; k++) {
        ref = errors[k], field = ref[0], v = ref[1];
        (this.$('[type=submit]')).prop('disabled', true);
        (this.$(".control-group." + field)).addClass('warning');
        results.push((this.$(".control-group." + field + " .controls")).append($("<span class='help-inline warning'>" + v + "</span>")));
      }
      return results;
    };

    EditAssetView.prototype.cancel = function(e) {
      this.model.rollback();
      return (this.$el.children(":first")).modal('hide');
    };

    EditAssetView.prototype.toggleAdvanced = function() {
      (this.$('.icon-play')).toggleClass('rotated');
      (this.$('.icon-play')).toggleClass('unrotated');
      return (this.$('.collapse-advanced')).collapse('toggle');
    };

    EditAssetView.prototype.displayAdvanced = function() {
      var edit, has_nocache, img;
      img = 'image' === this.$fv('mimetype');
      edit = url_test(this.model.get('uri'));
      has_nocache = img && edit;
      return (this.$('.advanced-accordion')).toggle(has_nocache === true);
    };

    return EditAssetView;

  })(Backbone.View);

  API.View.AssetRowView = AssetRowView = (function(superClass) {
    extend(AssetRowView, superClass);

    function AssetRowView() {
      this.hidePopover = bind(this.hidePopover, this);
      this.showPopover = bind(this.showPopover, this);
      this["delete"] = bind(this["delete"], this);
      this.edit = bind(this.edit, this);
      this.download = bind(this.download, this);
      this.setEnabled = bind(this.setEnabled, this);
      this.toggleIsEnabled = bind(this.toggleIsEnabled, this);
      this.render = bind(this.render, this);
      this.initialize = bind(this.initialize, this);
      return AssetRowView.__super__.constructor.apply(this, arguments);
    }

    AssetRowView.prototype.tagName = "tr";

    AssetRowView.prototype.initialize = function(options) {
      return this.template = get_template('asset-row');
    };

    AssetRowView.prototype.render = function() {
      var json;
      this.$el.html(this.template(_.extend(json = this.model.toJSON(), {
        name: insertWbr(json.name),
        start_date: (date_to(json.start_date)).string(),
        end_date: (date_to(json.end_date)).string()
      })));
      this.$el.prop('id', this.model.get('asset_id'));
      (this.$(".delete-asset-button")).popover({
        content: get_template('confirm-delete')
      });
      (this.$(".toggle input")).prop("checked", this.model.get('is_enabled'));
      (this.$(".asset-icon")).addClass((function() {
        switch (this.model.get("mimetype")) {
          case "video":
            return "icon-facetime-video";
          case "streaming":
            return "icon-facetime-video";
          case "image":
            return "icon-picture";
          case "webpage":
            return "icon-globe";
          default:
            return "";
        }
      }).call(this));
      if ((this.model.get("is_processing")) === 1) {
        (this.$('input, button')).prop('disabled', true);
        (this.$(".asset-toggle")).html(get_template('processing-message'));
      }
      return this.el;
    };

    AssetRowView.prototype.events = {
      'change .is_enabled-toggle input': 'toggleIsEnabled',
      'click .download-asset-button': 'download',
      'click .edit-asset-button': 'edit',
      'click .delete-asset-button': 'showPopover'
    };

    AssetRowView.prototype.toggleIsEnabled = function(e) {
      var save, val;
      val = (1 + this.model.get('is_enabled')) % 2;
      this.model.set({
        is_enabled: val
      });
      this.setEnabled(false);
      save = this.model.save();
      save.done((function(_this) {
        return function() {
          return _this.setEnabled(true);
        };
      })(this));
      save.fail((function(_this) {
        return function() {
          _this.model.set(_this.model.previousAttributes(), {
            silent: true
          });
          _this.setEnabled(true);
          return _this.render();
        };
      })(this));
      return true;
    };

    AssetRowView.prototype.setEnabled = function(enabled) {
      if (enabled) {
        this.$el.removeClass('warning');
        this.delegateEvents();
        return (this.$('input, button')).prop('disabled', false);
      } else {
        this.hidePopover();
        this.undelegateEvents();
        this.$el.addClass('warning');
        return (this.$('input, button')).prop('disabled', true);
      }
    };

    AssetRowView.prototype.download = function(e) {
      window.open('/api/v1.2/assets/' + this.model.id + '/content');
      return false;
    };

    AssetRowView.prototype.edit = function(e) {
      new EditAssetView({
        model: this.model
      });
      return false;
    };

    AssetRowView.prototype["delete"] = function(e) {
      var xhr;
      this.hidePopover();
      if ((xhr = this.model.destroy()) === !false) {
        xhr.done((function(_this) {
          return function() {
            return _this.remove();
          };
        })(this));
      } else {
        this.remove();
      }
      return false;
    };

    AssetRowView.prototype.showPopover = function() {
      if (!($('.popover')).length) {
        (this.$(".delete-asset-button")).popover('show');
        ($('.confirm-delete')).click(this["delete"]);
        ($(window)).one('click', this.hidePopover);
      }
      return false;
    };

    AssetRowView.prototype.hidePopover = function() {
      (this.$(".delete-asset-button")).popover('hide');
      return false;
    };

    return AssetRowView;

  })(Backbone.View);

  API.View.AssetsView = AssetsView = (function(superClass) {
    extend(AssetsView, superClass);

    function AssetsView() {
      this.render = bind(this.render, this);
      this.update_order = bind(this.update_order, this);
      this.initialize = bind(this.initialize, this);
      return AssetsView.__super__.constructor.apply(this, arguments);
    }

    AssetsView.prototype.initialize = function(options) {
      var event, k, len, ref;
      ref = 'reset add remove sync'.split(' ');
      for (k = 0, len = ref.length; k < len; k++) {
        event = ref[k];
        this.collection.bind(event, this.render);
      }
      return this.sorted = (this.$('#active-assets')).sortable({
        containment: 'parent',
        axis: 'y',
        helper: 'clone',
        update: this.update_order
      });
    };

    AssetsView.prototype.update_order = function() {
      var active, el, i, id, k, l, len, len1, ref;
      active = (this.$('#active-assets')).sortable('toArray');
      for (i = k = 0, len = active.length; k < len; i = ++k) {
        id = active[i];
        this.collection.get(id).set('play_order', i);
      }
      ref = (this.$('#inactive-assets tr')).toArray();
      for (l = 0, len1 = ref.length; l < len1; l++) {
        el = ref[l];
        this.collection.get(el.id).set('play_order', active.length);
      }
      return $.post('/api/v1/assets/order', {
        ids: ((this.$('#active-assets')).sortable('toArray')).join(',')
      });
    };

    AssetsView.prototype.render = function() {
      var k, l, len, len1, ref, ref1, which;
      this.collection.sort();
      ref = ['active', 'inactive'];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        (this.$("#" + which + "-assets")).html('');
      }
      this.collection.each((function(_this) {
        return function(model) {
          which = model.active() ? 'active' : 'inactive';
          return (_this.$("#" + which + "-assets")).append((new AssetRowView({
            model: model
          })).render());
        };
      })(this));
      ref1 = ['inactive', 'active'];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        which = ref1[l];
        this.$("." + which + "-table thead").toggle(!!(this.$("#" + which + "-assets tr").length));
      }
      this.update_order();
      return this.el;
    };

    return AssetsView;

  })(Backbone.View);

  API.App = App = (function(superClass) {
    extend(App, superClass);

    function App() {
      this.next = bind(this.next, this);
      this.previous = bind(this.previous, this);
      this.add = bind(this.add, this);
      this.initialize = bind(this.initialize, this);
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      var address, error, k, len, results, ws;
      ($(window)).ajaxError((function(_this) {
        return function(e, r) {
          var err, j;
          ($('#request-error')).html((get_template('request-error'))());
          if ((j = $.parseJSON(r.responseText)) && (err = j.error)) {
            return ($('#request-error .msg')).text('Server Error: ' + err);
          }
        };
      })(this));
      ($(window)).ajaxSuccess((function(_this) {
        return function(data) {
          return ($('#request-error')).html('');
        };
      })(this));
      (API.assets = new Assets()).fetch();
      API.assetsView = new AssetsView({
        collection: API.assets,
        el: this.$('#assets')
      });
      results = [];
      for (k = 0, len = ws_addresses.length; k < len; k++) {
        address = ws_addresses[k];
        try {
          ws = new WebSocket(address);
          results.push(ws.onmessage = function(x) {
            var model, save;
            model = API.assets.get(x.data);
            if (model) {
              return save = model.fetch();
            }
          });
        } catch (_error) {
          error = _error;
          results.push(false);
        }
      }
      return results;
    };

    App.prototype.events = {
      'click #add-asset-button': 'add',
      'click #previous-asset-button': 'previous',
      'click #next-asset-button': 'next'
    };

    App.prototype.add = function(e) {
      new AddAssetView;
      return false;
    };

    App.prototype.previous = function(e) {
      return $.get('/api/v1/assets/control/previous');
    };

    App.prototype.next = function(e) {
      return $.get('/api/v1/assets/control/next');
    };

    return App;

  })(Backbone.View);

}).call(this);
