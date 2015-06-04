fs = require 'fs'
cheerio = require 'cheerio'
_ = require 'lodash'


# Loading a file
target = fs.readFileSync './target.html', 'utf-8'



# Scraping
$ = cheerio.load target,
  normalizeWhitespace: true



class Scraper

  constructor: (@root) ->


  getText: (element) =>
    res = element.map (i, e) ->
      return _.trim $(e).text()
    return res.get()[0]


  getKey: () =>
    _.trim $('.top_title').text()


  pushTextToModel: (element, model) =>
    o = @getText element
    p = _.last(model)
    p.txt ?= []
    p.txt.push o
    return o


  pushTitleToModel: (element, model) =>
    o = {title: @getText element}
    p = _.last(model)
    p.txt ?= []
    p.txt.push o
    return o


  listToObj: () =>

    model = []

    @root.children().map (i, e) =>

      $(e).children().map (_i, _e) =>

        # if the element is the top title then ignore it.
        if $(_e).hasClass('top_title')
          return

        # if the element is the first level title then set as title.
        if $(_e).hasClass('word_c_title')
          o =
            title: @getText $(_e)
          model.push o
          return

        # if the element is the second level title then set as title.
        if $(_e).hasClass('word_l_title')
          @pushTitleToModel $(_e), model
          return

        # if the element does NOT include nested list
        if $(_e).children().length == 0

          # and if next element is a list
          if $(_e).next().children().length > 0

            # then set as title
            @pushTitleToModel $(_e), _.last(model).txt
            return

          # if nest element is NOT a list then push as text.
          @pushTextToModel $(_e), _.last(model).txt
          return


        # if the element includes at least one nested list
        # then repeat recursive function until elements have no children.
        do => do recursive = ( m = _.last(model).txt, self = _e) =>
          $(self).children().map (__i, __e) =>

            if $(__e).children().length == 0

              if $(__e).next().children().length > 0
                @pushTitleToModel $(__e), _.last(m).txt
                return

              @pushTextToModel $(__e), _.last(m).txt

            else return recursive _.last(m).txt, __e

    return model




html = new Scraper $('.word_list')



# Mapping
result = {}
result[html.getKey()] = html.listToObj()

console.log 'Converted.'

# Output
fs.writeFile './result.json', JSON.stringify(result, null, '  ')
