(function() {
  var $, Scraper, _, cheerio, fs, html, result, target,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  cheerio = require('cheerio');

  _ = require('lodash');

  target = fs.readFileSync('./target.html', 'utf-8');

  $ = cheerio.load(target, {
    normalizeWhitespace: true
  });

  Scraper = (function() {
    function Scraper(root) {
      this.root = root;
      this.listToObj = bind(this.listToObj, this);
      this.pushTitleToModel = bind(this.pushTitleToModel, this);
      this.pushTextToModel = bind(this.pushTextToModel, this);
      this.getKey = bind(this.getKey, this);
      this.getText = bind(this.getText, this);
    }

    Scraper.prototype.getText = function(element) {
      var res;
      res = element.map(function(i, e) {
        return _.trim($(e).text());
      });
      return res.get()[0];
    };

    Scraper.prototype.getKey = function() {
      return _.trim($('.top_title').text());
    };

    Scraper.prototype.pushTextToModel = function(element, model) {
      var o, p;
      o = this.getText(element);
      p = _.last(model);
      if (p.txt == null) {
        p.txt = [];
      }
      p.txt.push(o);
      return o;
    };

    Scraper.prototype.pushTitleToModel = function(element, model) {
      var o, p;
      o = {
        title: this.getText(element)
      };
      p = _.last(model);
      if (p.txt == null) {
        p.txt = [];
      }
      p.txt.push(o);
      return o;
    };

    Scraper.prototype.listToObj = function() {
      var model;
      model = [];
      this.root.children().map((function(_this) {
        return function(i, e) {
          return $(e).children().map(function(_i, _e) {
            var o;
            if ($(_e).hasClass('top_title')) {
              return;
            }
            if ($(_e).hasClass('word_c_title')) {
              o = {
                title: _this.getText($(_e))
              };
              model.push(o);
              return;
            }
            if ($(_e).hasClass('word_l_title')) {
              _this.pushTitleToModel($(_e), model);
              return;
            }
            if ($(_e).children().length === 0) {
              if ($(_e).next().children().length > 0) {
                _this.pushTitleToModel($(_e), _.last(model).txt);
                return;
              }
              _this.pushTextToModel($(_e), _.last(model).txt);
              return;
            }
            return (function() {
              var recursive;
              return (recursive = function(m, self) {
                return $(self).children().map(function(__i, __e) {
                  if ($(__e).children().length === 0) {
                    if ($(__e).next().children().length > 0) {
                      _this.pushTitleToModel($(__e), _.last(m).txt);
                      return;
                    }
                    return _this.pushTextToModel($(__e), _.last(m).txt);
                  } else {
                    return recursive(_.last(m).txt, __e);
                  }
                });
              })(_.last(model).txt, _e);
            })();
          });
        };
      })(this));
      return model;
    };

    return Scraper;

  })();

  html = new Scraper($('.word_list'));

  result = {};

  result[html.getKey()] = html.listToObj();

  console.log('Converted.');

  fs.writeFile('./result.json', JSON.stringify(result, null, '  '));

}).call(this);
