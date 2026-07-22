

dist: base-dist ui-dist

.PHONY: dist

lint: base-lint ui-lint

.PHONY: lint


base-dist:
	$(MAKE) -C base update-dist

.PHONY: base-dist

ui-dist:
	$(MAKE) -C ui update-dist

.PHONY: ui-dist

base-lint:
	$(MAKE) -C base lint

.PHONY: base-dist

ui-lint:
	$(MAKE) -C ui lint

.PHONY: ui-lint

ui-index-entries-json:
	$(MAKE) -C ui index-entries-json

.PHONY: ui-index-entries-json

ui-index-entries-map-txt:
	$(MAKE) -C ui index-entries-map-txt

.PHONY: ui-index-entries-map-txt


ui-awblog-pot: 
	$(MAKE) -C ui awblog-pot

.PHONY: ui-awblog-pot

ui-awblog-msg-json:
	$(MAKE) -C ui awblog-msg-json

.PHONY: ui-awblog-msg-json

# vi: se ts=4 sw=4 noet:
