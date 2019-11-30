export or9CustomElementBaseMixin;

function or9CustomElementBaseMixin (BaseClass) {
	return class extends BaseClass {
		constructor (...args) {
			super(args);

			this.shadowRoot.querySelectorAll("*")
			.forEach((element) => {

				element.getAttributeNames()
				.filter((attr) => /^on/.test(attr))
				.forEach((attr) => {
					const handler = element.getAttribute(attr);

					if (/^this\./.test(handler)) {
						const instanceMethod = handler.replace(/^this\./, "");
						element[attr] = this[instanceMethod].bind(this);
					}
				});
			});
		}

		$ (queryStr) {
			return this.shadowRoot.querySelector(queryStr);
		}
	}
}