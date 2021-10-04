
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    // this file is generated by build-rarity.js
    var rarity = {
      "iron": [
        0,
        32,
        65,
        100,
        135,
        172,
        211,
        250,
        291,
        333,
        418,
        506,
        598,
        693,
        791,
        893,
        998,
        1106,
        1218,
        1333,
        1503,
        1679,
        1862,
        2052,
        2249,
        2452,
        2662,
        2879,
        3103,
        3333
      ],
      "bronze": [
        0,
        35,
        72,
        110,
        149,
        189,
        232,
        275,
        320,
        366,
        460,
        557,
        658,
        762,
        870,
        982,
        1098,
        1217,
        1340,
        1466,
        1653,
        1847,
        2048,
        2257,
        2474,
        2697,
        2928,
        3167,
        3413,
        3666,
        3978,
        4301,
        4637,
        4984,
        5345,
        5718,
        6103,
        6501,
        6910,
        7334
      ],
      "silver": [
        0,
        38,
        78,
        120,
        162,
        206,
        253,
        300,
        349,
        400,
        502,
        607,
        718,
        832,
        949,
        1072,
        1198,
        1327,
        1462,
        1600,
        1804,
        2015,
        2234,
        2462,
        2699,
        2942,
        3194,
        3455,
        3724,
        4000,
        4339,
        4692,
        5058,
        5437,
        5831,
        6238,
        6658,
        7092,
        7538,
        8000,
        8678,
        9383,
        10115,
        10874,
        11662,
        12474,
        13315,
        14183,
        15078,
        16000,
        17017,
        18074,
        19172,
        20312,
        21492
      ],
      "gold": [
        0,
        42,
        85,
        130,
        176,
        224,
        274,
        325,
        378,
        433,
        543,
        658,
        777,
        901,
        1028,
        1161,
        1297,
        1438,
        1583,
        1733,
        1954,
        2183,
        2421,
        2668,
        2924,
        3188,
        3461,
        3743,
        4034,
        4333,
        4701,
        5083,
        5480,
        5890,
        6317,
        6757,
        7212,
        7683,
        8167,
        8667,
        9402,
        10165,
        10958,
        11781,
        12633,
        13514,
        14425,
        15365,
        16335,
        17333,
        18435,
        19581,
        20770,
        22005,
        23283,
        24605,
        25970,
        27381,
        28835,
        30333,
        31802,
        33329,
        34917,
        36561,
        38266,
        40028,
        41850,
        43729,
        45669,
        47667,
        49503,
        51412,
        53395,
        55452,
        57582,
        59786,
        62062,
        64412,
        66836,
        69333,
        71904,
        74577,
        77354,
        80233,
        83214,
        86299,
        89487,
        92777,
        96170,
        99667,
        102237,
        104911,
        107687,
        110566,
        113549,
        116633,
        119820,
        123111,
        126504
      ],
      "platinum": [
        0,
        45,
        91,
        140,
        189,
        241,
        295,
        350,
        407,
        466,
        585,
        708,
        837,
        970,
        1107,
        1250,
        1397,
        1548,
        1705,
        1866,
        2104,
        2351,
        2607,
        2873,
        3149,
        3433,
        3727,
        4031,
        4344,
        4666,
        5062,
        5474,
        5901,
        6343,
        6803,
        7277,
        7767,
        8274,
        8795,
        9334,
        10125,
        10947,
        11801,
        12687,
        13605,
        14553,
        15534,
        16547,
        17591,
        18666,
        19853,
        21087,
        22368,
        23698,
        25074,
        26498,
        27968,
        29487,
        31053,
        32666,
        34248,
        35893,
        37603,
        39374,
        41209,
        43107,
        45069,
        47093,
        49182,
        51334,
        53311,
        55367,
        57502,
        59717,
        62012,
        64385,
        66836,
        69367,
        71977,
        74666,
        77435,
        80314,
        83304,
        86405,
        89615,
        92938,
        96370,
        99914,
        103568,
        107334,
        110102,
        112981,
        115970,
        119071,
        122283,
        125605,
        129037,
        132581,
        136235
      ],
      "black": [
        0,
        48,
        98,
        150,
        203,
        258,
        317,
        375,
        437,
        500,
        627,
        759,
        897,
        1040,
        1187,
        1340,
        1497,
        1659,
        1827,
        2000,
        2255,
        2519,
        2793,
        3078,
        3374,
        3678,
        3993,
        4319,
        4655,
        5000,
        5424,
        5865,
        6323,
        6797,
        7289,
        7797,
        8322,
        8865,
        9423,
        10001,
        10848,
        11729,
        12644,
        13593,
        14577,
        15593,
        16644,
        17729,
        18848,
        20000,
        21272,
        22593,
        23966,
        25391,
        26865,
        28391,
        29966,
        31593,
        33272,
        35000,
        36695,
        38457,
        40289,
        42186,
        44153,
        46187,
        48288,
        50457,
        52695,
        55001,
        57119,
        59322,
        61610,
        63983,
        66441,
        68984,
        71610,
        74322,
        77118,
        80000,
        82967,
        86051,
        89255,
        92577,
        96017,
        99576,
        103254,
        107051,
        110966,
        115001,
        117966,
        121052,
        124254,
        127577,
        131018,
        134577,
        138254,
        142052,
        145967
      ]
    };

    /* src\App.svelte generated by Svelte v3.42.4 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i][0];
    	child_ctx[24] = list[i][1];
    	child_ctx[25] = list;
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (143:0) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let t1_value = /*requiredMinLevel*/ ctx[4] + 1 + "";
    	let t1;
    	let t2;
    	let t3_value = (rarity[/*selectedRarity*/ ctx[0]][/*requiredMinLevel*/ ctx[4] + 1] - /*requiredMinValue*/ ctx[7] || '-') + "";
    	let t3;
    	let t4;

    	return {
    		c() {
    			t0 = text("需先餵銅肥至 LV");
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")。");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, t3, anchor);
    			insert(target, t4, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*requiredMinLevel*/ 16 && t1_value !== (t1_value = /*requiredMinLevel*/ ctx[4] + 1 + "")) set_data(t1, t1_value);
    			if (dirty & /*selectedRarity, requiredMinLevel, requiredMinValue*/ 145 && t3_value !== (t3_value = (rarity[/*selectedRarity*/ ctx[0]][/*requiredMinLevel*/ ctx[4] + 1] - /*requiredMinValue*/ ctx[7] || '-') + "")) set_data(t3, t3_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    			if (detaching) detach(t3);
    			if (detaching) detach(t4);
    		}
    	};
    }

    // (141:0) {#if requiredMinValue < 0}
    function create_if_block(ctx) {
    	let t0;
    	let t1_value = -/*requiredMinValue*/ ctx[7] + "";
    	let t1;
    	let t2;

    	return {
    		c() {
    			t0 = text("經驗值溢出 ");
    			t1 = text(t1_value);
    			t2 = text("。");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*requiredMinValue*/ 128 && t1_value !== (t1_value = -/*requiredMinValue*/ ctx[7] + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    		}
    	};
    }

    // (150:4) {#each rarityNames as name}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*name*/ ctx[27] + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*name*/ ctx[27];
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (168:4) {#each Object.entries(expUnits) as [unitName, value]}
    function create_each_block(ctx) {
    	let label;
    	let t0_value = /*unitName*/ ctx[23] + "";
    	let t0;
    	let t1;
    	let t2_value = /*value*/ ctx[24] + "";
    	let t2;
    	let t3;
    	let label_for_value;
    	let t4;
    	let div;
    	let button0;
    	let t5;
    	let button0_disabled_value;
    	let t6;
    	let input;
    	let input_id_value;
    	let t7;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[17](/*unitName*/ ctx[23]);
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[18].call(input, /*unitName*/ ctx[23]);
    	}

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[19](/*unitName*/ ctx[23]);
    	}

    	return {
    		c() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			div = element("div");
    			button0 = element("button");
    			t5 = text("-");
    			t6 = space();
    			input = element("input");
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			attr(label, "for", label_for_value = /*unitName*/ ctx[23]);
    			attr(label, "class", "svelte-11lkdat");
    			attr(button0, "type", "button");
    			button0.disabled = button0_disabled_value = /*selectedUnits*/ ctx[2][/*unitName*/ ctx[23]] < 1;
    			attr(input, "id", input_id_value = /*unitName*/ ctx[23]);
    			attr(input, "type", "number");
    			attr(input, "min", "0");
    			attr(input, "class", "svelte-11lkdat");
    			attr(button1, "type", "button");
    			attr(div, "class", "number-group svelte-11lkdat");
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			append(label, t0);
    			append(label, t1);
    			append(label, t2);
    			append(label, t3);
    			insert(target, t4, anchor);
    			insert(target, div, anchor);
    			append(div, button0);
    			append(button0, t5);
    			append(div, t6);
    			append(div, input);
    			set_input_value(input, /*selectedUnits*/ ctx[2][/*unitName*/ ctx[23]]);
    			append(div, t7);
    			append(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", click_handler_2),
    					listen(input, "input", input_input_handler),
    					listen(button1, "click", click_handler_3)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*selectedUnits*/ 4 && button0_disabled_value !== (button0_disabled_value = /*selectedUnits*/ ctx[2][/*unitName*/ ctx[23]] < 1)) {
    				button0.disabled = button0_disabled_value;
    			}

    			if (dirty & /*selectedUnits, Object, expUnits*/ 2052 && to_number(input.value) !== /*selectedUnits*/ ctx[2][/*unitName*/ ctx[23]]) {
    				set_input_value(input, /*selectedUnits*/ ctx[2][/*unitName*/ ctx[23]]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			if (detaching) detach(t4);
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let label0;
    	let t7;
    	let select;
    	let t8;
    	let label1;
    	let t10;
    	let div0;
    	let button0;
    	let t11;
    	let button0_disabled_value;
    	let button0_title_value;
    	let t12;
    	let input0;
    	let t13;
    	let button1;
    	let t14;
    	let button1_disabled_value;
    	let button1_title_value;
    	let t15;
    	let label2;
    	let input1;
    	let t16;
    	let t17;
    	let fieldset;
    	let legend;
    	let t19;
    	let div2;
    	let t20;
    	let label3;
    	let t22;
    	let input2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*requiredMinValue*/ ctx[7] < 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*rarityNames*/ ctx[10];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = Object.entries(/*expUnits*/ ctx[11]);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			h1 = element("h1");
    			h1.textContent = "Aigis EXP Calculator";
    			t1 = space();
    			p = element("p");
    			t2 = text("共可獲得 ");
    			t3 = text(/*totalExp*/ ctx[3]);
    			t4 = text(" 經驗。\r\n\r\n");
    			if_block.c();
    			t5 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "稀有度";
    			t7 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			label1 = element("label");
    			label1.textContent = "目標等級";
    			t10 = space();
    			div0 = element("div");
    			button0 = element("button");
    			t11 = text("<");
    			t12 = space();
    			input0 = element("input");
    			t13 = space();
    			button1 = element("button");
    			t14 = text(">");
    			t15 = space();
    			label2 = element("label");
    			input1 = element("input");
    			t16 = text("\r\n    使用育成聖靈");
    			t17 = space();
    			fieldset = element("fieldset");
    			legend = element("legend");
    			legend.textContent = "聖靈︰";
    			t19 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			label3 = element("label");
    			label3.textContent = "額外經驗值";
    			t22 = space();
    			input2 = element("input");
    			attr(label0, "for", "rarity");
    			attr(label0, "class", "svelte-11lkdat");
    			attr(select, "id", "rarity");
    			attr(select, "class", "svelte-11lkdat");
    			if (/*selectedRarity*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			attr(label1, "for", "goalLevel");
    			attr(label1, "class", "svelte-11lkdat");
    			attr(button0, "type", "button");
    			button0.disabled = button0_disabled_value = !/*goalLevelPresetPrev*/ ctx[9];
    			attr(button0, "title", button0_title_value = /*goalLevelPresetPrev*/ ctx[9] || "");
    			attr(input0, "id", "goalLevel");
    			attr(input0, "type", "number");
    			attr(input0, "min", "0");
    			attr(input0, "class", "svelte-11lkdat");
    			attr(button1, "type", "button");
    			button1.disabled = button1_disabled_value = !/*goalLevelPresetNext*/ ctx[8];
    			attr(button1, "title", button1_title_value = /*goalLevelPresetNext*/ ctx[8] || "");
    			attr(div0, "class", "number-group svelte-11lkdat");
    			attr(input1, "type", "checkbox");
    			attr(input1, "class", "svelte-11lkdat");
    			attr(label2, "class", "span-2 svelte-11lkdat");
    			attr(div1, "class", "form-group svelte-11lkdat");
    			attr(label3, "for", "custom");
    			attr(label3, "class", "svelte-11lkdat");
    			attr(input2, "id", "custom");
    			attr(input2, "type", "number");
    			attr(input2, "min", "0");
    			attr(input2, "class", "svelte-11lkdat");
    			attr(div2, "class", "form-group svelte-11lkdat");
    		},
    		m(target, anchor) {
    			insert(target, h1, anchor);
    			insert(target, t1, anchor);
    			insert(target, p, anchor);
    			append(p, t2);
    			append(p, t3);
    			append(p, t4);
    			if_block.m(p, null);
    			insert(target, t5, anchor);
    			insert(target, div1, anchor);
    			append(div1, label0);
    			append(div1, t7);
    			append(div1, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*selectedRarity*/ ctx[0]);
    			append(div1, t8);
    			append(div1, label1);
    			append(div1, t10);
    			append(div1, div0);
    			append(div0, button0);
    			append(button0, t11);
    			append(div0, t12);
    			append(div0, input0);
    			set_input_value(input0, /*goalLevel*/ ctx[1]);
    			append(div0, t13);
    			append(div0, button1);
    			append(button1, t14);
    			append(div1, t15);
    			append(div1, label2);
    			append(label2, input1);
    			input1.checked = /*sarietto*/ ctx[5];
    			append(label2, t16);
    			insert(target, t17, anchor);
    			insert(target, fieldset, anchor);
    			append(fieldset, legend);
    			append(fieldset, t19);
    			append(fieldset, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append(div2, t20);
    			append(div2, label3);
    			append(div2, t22);
    			append(div2, input2);
    			set_input_value(input2, /*custom*/ ctx[6]);

    			if (!mounted) {
    				dispose = [
    					listen(select, "change", /*select_change_handler*/ ctx[12]),
    					listen(button0, "click", /*click_handler*/ ctx[13]),
    					listen(input0, "input", /*input0_input_handler*/ ctx[14]),
    					listen(button1, "click", /*click_handler_1*/ ctx[15]),
    					listen(input1, "change", /*input1_change_handler*/ ctx[16]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[20])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*totalExp*/ 8) set_data(t3, /*totalExp*/ ctx[3]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*rarityNames*/ 1024) {
    				each_value_1 = /*rarityNames*/ ctx[10];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedRarity, rarityNames*/ 1025) {
    				select_option(select, /*selectedRarity*/ ctx[0]);
    			}

    			if (dirty & /*goalLevelPresetPrev*/ 512 && button0_disabled_value !== (button0_disabled_value = !/*goalLevelPresetPrev*/ ctx[9])) {
    				button0.disabled = button0_disabled_value;
    			}

    			if (dirty & /*goalLevelPresetPrev*/ 512 && button0_title_value !== (button0_title_value = /*goalLevelPresetPrev*/ ctx[9] || "")) {
    				attr(button0, "title", button0_title_value);
    			}

    			if (dirty & /*goalLevel*/ 2 && to_number(input0.value) !== /*goalLevel*/ ctx[1]) {
    				set_input_value(input0, /*goalLevel*/ ctx[1]);
    			}

    			if (dirty & /*goalLevelPresetNext*/ 256 && button1_disabled_value !== (button1_disabled_value = !/*goalLevelPresetNext*/ ctx[8])) {
    				button1.disabled = button1_disabled_value;
    			}

    			if (dirty & /*goalLevelPresetNext*/ 256 && button1_title_value !== (button1_title_value = /*goalLevelPresetNext*/ ctx[8] || "")) {
    				attr(button1, "title", button1_title_value);
    			}

    			if (dirty & /*sarietto*/ 32) {
    				input1.checked = /*sarietto*/ ctx[5];
    			}

    			if (dirty & /*selectedUnits, Object, expUnits*/ 2052) {
    				each_value = Object.entries(/*expUnits*/ ctx[11]);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, t20);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*custom*/ 64 && to_number(input2.value) !== /*custom*/ ctx[6]) {
    				set_input_value(input2, /*custom*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(h1);
    			if (detaching) detach(t1);
    			if (detaching) detach(p);
    			if_block.d();
    			if (detaching) detach(t5);
    			if (detaching) detach(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach(t17);
    			if (detaching) detach(fieldset);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function createStorage(prefix = "aigis-exp-calculator") {
    	return { get, set };

    	function get(key, default_) {
    		const value = localStorage.getItem(`${prefix}/${key}`);

    		if (value === null) {
    			return default_;
    		}

    		return JSON.parse(value);
    	}

    	function set(key, value) {
    		localStorage.setItem(`${prefix}/${key}`, JSON.stringify(value));
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let requiredMinValue;
    	const storage = createStorage();
    	const rarityNames = Object.keys(rarity);
    	let selectedRarity = storage.get("selectedRarity", "iron");
    	let goalLevel = Math.min(storage.get("goalLevel", 99), rarity[selectedRarity].length);

    	const expUnits = {
    		"微金祝": 1750,
    		"小銀祝": 4000,
    		"八倍白胖": 8000,
    		"八倍黑角": 8400,
    		"活動經驗包": 10000,
    		"八倍皇帝": 16000,
    		"小金祝/贈送祝聖": 18000,
    		"小白祝": 19000,
    		"小黑祝": 20000,
    		"八倍黑胖": 40000,
    		"大祝聖哈比": 150000
    	};

    	const goalLevelPresets = {
    		iron: [],
    		bronze: [],
    		silver: [30, 50, 55],
    		gold: [20, 50, 60, 80, 99],
    		platinum: [50, 70, 90, 99],
    		black: [50, 80, 99]
    	};

    	const selectedUnits = Object.assign(Object.fromEntries(Object.entries(expUnits).map(([name]) => [name, 0])), storage.get("selectedUnits"));
    	let totalExp = 0;
    	let requiredMinLevel = 0;
    	let sarietto = storage.get("sarietto", false);
    	let goalLevelPresetNext = 0;
    	let goalLevelPresetPrev = 0;
    	let custom = storage.get("custom", 0);

    	function select_change_handler() {
    		selectedRarity = select_value(this);
    		$$invalidate(0, selectedRarity);
    		$$invalidate(10, rarityNames);
    	}

    	const click_handler = () => $$invalidate(1, goalLevel = goalLevelPresetPrev);

    	function input0_input_handler() {
    		goalLevel = to_number(this.value);
    		($$invalidate(1, goalLevel), $$invalidate(0, selectedRarity));
    	}

    	const click_handler_1 = () => $$invalidate(1, goalLevel = goalLevelPresetNext);

    	function input1_change_handler() {
    		sarietto = this.checked;
    		$$invalidate(5, sarietto);
    	}

    	const click_handler_2 = unitName => $$invalidate(2, selectedUnits[unitName]--, selectedUnits);

    	function input_input_handler(unitName) {
    		selectedUnits[unitName] = to_number(this.value);
    		$$invalidate(2, selectedUnits);
    		$$invalidate(11, expUnits);
    	}

    	const click_handler_3 = unitName => $$invalidate(2, selectedUnits[unitName]++, selectedUnits);

    	function input2_input_handler() {
    		custom = to_number(this.value);
    		$$invalidate(6, custom);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*goalLevel, selectedRarity*/ 3) {
    			// goal level cap
    			{
    				if (goalLevel >= rarity[selectedRarity].length) {
    					$$invalidate(1, goalLevel = rarity[selectedRarity].length);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*sarietto, selectedUnits, totalExp, custom*/ 108) {
    			// calc total exp
    			{
    				$$invalidate(3, totalExp = 0);
    				const multiply = sarietto ? 11 : 10;

    				for (const [name, count] of Object.entries(selectedUnits)) {
    					$$invalidate(3, totalExp += count * expUnits[name] * multiply / 10);
    				}

    				$$invalidate(3, totalExp += custom);
    			}
    		}

    		if ($$self.$$.dirty & /*selectedRarity, goalLevel, totalExp*/ 11) {
    			$$invalidate(7, requiredMinValue = rarity[selectedRarity][goalLevel - 1] - totalExp);
    		}

    		if ($$self.$$.dirty & /*selectedRarity*/ 1) {
    			storage.set("selectedRarity", selectedRarity);
    		}

    		if ($$self.$$.dirty & /*goalLevel*/ 2) {
    			storage.set("goalLevel", goalLevel);
    		}

    		if ($$self.$$.dirty & /*selectedUnits*/ 4) {
    			storage.set("selectedUnits", selectedUnits);
    		}

    		if ($$self.$$.dirty & /*sarietto*/ 32) {
    			storage.set("sarietto", sarietto);
    		}

    		if ($$self.$$.dirty & /*custom*/ 64) {
    			storage.set("custom", custom);
    		}

    		if ($$self.$$.dirty & /*selectedRarity, requiredMinValue, requiredMinLevel*/ 145) {
    			// calc required min level
    			{
    				// find the level of min value
    				$$invalidate(4, requiredMinLevel = rarity[selectedRarity].findIndex(f => f > requiredMinValue));

    				if (requiredMinLevel < 0) {
    					$$invalidate(4, requiredMinLevel = rarity[selectedRarity].length);
    				}

    				$$invalidate(4, requiredMinLevel--, requiredMinLevel);
    			}
    		}

    		if ($$self.$$.dirty & /*selectedRarity, goalLevel*/ 3) {
    			// calc goal level default
    			{
    				const defaults = goalLevelPresets[selectedRarity];
    				let index;

    				if (defaults[defaults.length - 1] < goalLevel) {
    					index = defaults.length;
    				} else {
    					index = defaults.findIndex(i => i >= goalLevel);
    				}

    				$$invalidate(9, goalLevelPresetPrev = index > 0 ? defaults[index - 1] : 0);

    				if (index >= 0 && defaults[index] === goalLevel) {
    					if (index + 1 < defaults.length) {
    						index++;
    					} else {
    						index = -1;
    					}
    				}

    				$$invalidate(8, goalLevelPresetNext = index >= 0 ? defaults[index] : 0);
    			}
    		}
    	};

    	return [
    		selectedRarity,
    		goalLevel,
    		selectedUnits,
    		totalExp,
    		requiredMinLevel,
    		sarietto,
    		custom,
    		requiredMinValue,
    		goalLevelPresetNext,
    		goalLevelPresetPrev,
    		rarityNames,
    		expUnits,
    		select_change_handler,
    		click_handler,
    		input0_input_handler,
    		click_handler_1,
    		input1_change_handler,
    		click_handler_2,
    		input_input_handler,
    		click_handler_3,
    		input2_input_handler
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    /* eslint-env browser */

    const app = new App({
    	target: document.querySelector(".container")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
