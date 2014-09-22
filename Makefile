BIN         = ./node_modules/.bin
JSX_SOURCES = $(wildcard view/*.jsx)
TARGETS     = dist/TodoApp.app.js dist/LocalTodoApp.app.js
VIEWS       = $(patsubst view/%.jsx,dist/%.js,$(JSX_SOURCES))

all: dist todo

jsx: $(VIEWS)

dist: jsx $(TARGETS)

dist/%.js: view/%.jsx
	@mkdir -p $(@D)
	@$(BIN)/jsx $< > .js && mv .js $@

dist/%.app.js: ./%.js
	@mkdir -p $(@D)
	@$(BIN)/browserify $< -o $@

prepare:
	@if [ ! -e node_modules/ ]; then npm install; fi

clean:
	@find . -name '*.app.js' | xargs rm
	@find . -name '*.min.js' | xargs rm
	@rm -rf dist

todo:
	@echo
	@git grep -w --color -n 'TO\DO'
	@echo

lint:
	$(BIN)/jshint $(SOURCES)


