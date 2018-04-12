import im, {validateFunction, validateValue} from '../lib/immunitet';
import Chai from 'chai';
const {
    expect,
    assert,
    should,
} = Chai;

describe('"check" function', function () {
    function add(a, b) {
        return a + b;
    }

    let checkAdd = validateFunction(add);

    it('should properly run if only one argument processor is given', function () {
        checkAdd = validateFunction(add, {
            a: 'number',
        });

        let [result] = checkAdd(33, 2);
        expect(result).to.equal(35);
    });

    it('should properly run if empty argument processor is given', function () {
        checkAdd = validateFunction(add, {});

        let [result1] = checkAdd(5, 2);
        expect(result1).to.equal(7);

        checkAdd = validateFunction(add);
        let [result2] = checkAdd(5, 2);
        expect(result2).to.equal(7);

        checkAdd = validateFunction(add, null);
        let [result3] = checkAdd(5, 2);
        expect(result3).to.equal(7);

        checkAdd = validateFunction(add, undefined);
        let [result4] = checkAdd(5, 2);
        expect(result4).to.equal(7);

        checkAdd = validateFunction(add, []);
        let [result5] = checkAdd(5, 2);
        expect(result5).to.equal(7);
    });

    it('should accept argument processor parameter', function () {
        function addArray(a, b) {
            return a.map((val, key) => val + b[key]);
        }
        checkAdd = validateFunction(addArray, {
            a: 'split:,',
        });

        const [result] = checkAdd('2,3', [3, 4]);
        expect(result).to.deep.equal(['23', '34']);
    });

    it('should process "each" keyword with arguments to parse array values', function () {
        function addArray(a, b) {
            return a.map((val, key) => val + b[key]);
        }
        checkAdd = validateFunction(addArray, {
            a: 'split:,|each:number:convert',
        });

        const [result] = checkAdd('2,3', [3, 4]);
        expect(result).to.deep.equal([5, 7]);
    });

    it('should process a single value', function () {
        let splitString = validateFunction(null, 'split:,|each:number:convert');

        const [result] = splitString('3,4');
        expect(result).to.deep.equal([3, 4]);
    });

    it('should use a composite processor', function () {
        im.setAlias('toNumericArray', 'split:,|each:number:convert');

        let splitString = validateFunction(null, 'toNumericArray');

        const [result] = splitString('3,4');
        expect(result).to.deep.equal([3, 4]);
    });
});

describe('"validateValue" function', function () {
    let checkAdd = null;

    it('should properly run if only one argument processor is given', function () {
        checkAdd = validateValue({
            a: 'number:convert',
        });

        let [result, error] = checkAdd("33");
        expect(result).to.equal(33);
    });

    it('should throw Exception if empty arguments given to validateValue', function () {
        expect(() => validateValue(null)).to.throw(Error);
        expect(() => validateValue(undefined)).to.throw(Error);
        expect(() => validateValue('')).to.throw(Error);
        expect(() => validateValue(0)).to.throw(Error);
        expect(() => validateValue(false)).to.throw(Error);
        expect(() => validateValue(NaN)).to.throw(Error);
        expect(() => validateValue({})).to.throw(Error);
        expect(() => validateValue([])).to.throw(Error);
    });

    it('should process a single value', function () {
        let splitString = validateValue('split:,|each:number:convert');

        const [result] = splitString('3,4');
        expect(result).to.deep.equal([3, 4]);
    });

    it('should use a composite processor', function () {
        im.setAlias('toNumericArray', 'split:,|each:number:convert');

        let splitString = validateValue('toNumericArray');

        const [result] = splitString('3,4');
        expect(result).to.deep.equal([3, 4]);
    });
});

describe('check "number" pattern processor', function () {
    let checkAdd = null;
    function add(a, b) {
        return a + b;
    }

    it('given empty value "number" processor should return error', function () {
        checkAdd = validateFunction(add, {
            a: 'number',
            b: 'number',
        });
        let [, error1] = checkAdd('', 3);
        expect(error1).not.equal(null);

        let [, error2] = checkAdd(NaN, 3);
        expect(error2).not.equal(null);

        let [, error3] = checkAdd(null, 3);
        expect(error3).not.equal(null);

        let [, error4] = checkAdd(false, 3);
        expect(error4).not.equal(null);

        let [, error5] = checkAdd(undefined, 3);
        expect(error5).not.equal(null);
    });

    it('given a non "number" value should return error', function () {
        checkAdd = validateFunction(add, {
            a: 'number',
            b: 'number',
        });
        let [, error1] = checkAdd("-0x42", 3);
        expect(error1).not.equal(null);

        let [result2, error2] = checkAdd(Infinity, 2);
        expect(result2).to.equal(null);
        expect(error2).not.equal(null);

        let [result3, error3] = checkAdd(true, 2);
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);

        let [result5, error5] = checkAdd('true', 2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd([], 2);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({}, 2);
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);

        let [result8, error8] = checkAdd('abc', 2);
        expect(result8).to.equal(null);
        expect(error8).not.equal(null);
    });

    it('given a non "number" value and convert should convert argument to number', function () {
        checkAdd = validateFunction(add, {
            a: 'number:convert',
            b: 'number:convert',
        });
        let [result1, error1] = checkAdd('3', 2);
        expect(result1).to.equal(5);

        let [result2, error2] = checkAdd({toString: () => 3}, 2);
        expect(result2).to.equal(5);

        let [result3, error3] = checkAdd({valueOf: () => '3'}, 2);
        expect(result3).to.equal(5);

        let [result4, error4] = checkAdd('-7', 2);
        expect(result4).to.equal(-5);

        let [result5, error5] = checkAdd('abc', 2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd('3-', 2);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({toString: () => 'abc'}, 2);
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);

        let [result8, error8] = checkAdd({valueOf: () => '3ds'}, 2);
        expect(result8).to.equal(null);
        expect(error8).not.equal(null);

        let [result9, error9] = validateValue('number:wrongProcessor')(2);
        expect(result9).to.equal(null);
        expect(error9).not.equal(null);
    });
});

describe('check "integer" pattern processor', function () {
    let checkAdd = null;
    function add(a, b) {
        return a + b;
    }

    it('given empty values the "integer" processor should return error', function () {
        checkAdd = validateFunction(add, {
            a: 'integer',
            b: 'integer',
        });
        let [, error1] = checkAdd('', 3);
        expect(error1).not.equal(null);

        let [, error2] = checkAdd(NaN, 3);
        expect(error2).not.equal(null);

        let [, error3] = checkAdd(null, 3);
        expect(error3).not.equal(null);

        let [, error4] = checkAdd(false, 3);
        expect(error4).not.equal(null);

        let [, error5] = checkAdd(undefined, 3);
        expect(error5).not.equal(null);
    });

    it('given a non "integer" value should return error', function () {
        checkAdd = validateFunction(add, {
            a: 'integer',
            b: 'integer',
        });
        let [, error1] = checkAdd("-0x42", 3);
        expect(error1).not.equal(null);

        let [result2, error2] = checkAdd(Infinity, 2);
        expect(result2).to.equal(null);
        expect(error2).not.equal(null);

        let [result3, error3] = checkAdd(true, 2);
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);

        let [result5, error5] = checkAdd('true', 2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd([], 2);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({}, 2);
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);

        let [result8, error8] = checkAdd('abc', 2);
        expect(result8).to.equal(null);
        expect(error8).not.equal(null);
    });

    it('given a non "integer" value and round, floor, ceil processors should convert argument to number', function () {
        checkAdd = validateFunction(add, {
            a: 'integer:round',
            b: 'integer:ceil',
        });
        let [result1, error1] = checkAdd('3', 2);
        expect(result1).to.equal(5);

        let [result2, error2] = checkAdd({toString: () => 3}, 2);
        expect(result2).to.equal(5);

        let [result3, error3] = checkAdd({valueOf: () => '3'}, 2);
        expect(result3).to.equal(5);

        let [result4, error4] = checkAdd('-7', 2);
        expect(result4).to.equal(-5);

        let [result5, error5] = checkAdd('abc', 2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd('3-', 2);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({toString: () => 'abc'}, 2);
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);

        let [result8, error8] = checkAdd({valueOf: () => '3ds'}, 2);
        expect(result8).to.equal(null);
        expect(error8).not.equal(null);

        let [result9, error9] = checkAdd({valueOf: () => '3.3'}, 2);
        expect(result9).to.equal(5);

        let [result10] = checkAdd(3.3, 2.2);
        expect(result10).to.equal(6);

        let [result11] = checkAdd(3.6, 2.6);
        expect(result11).to.equal(7);

        checkAdd = validateFunction(add, {
            a: 'integer:round',
            b: 'integer:floor',
        });

        let [result12] = checkAdd(3.3, 2.2);
        expect(result12).to.equal(5);

        let [result13] = checkAdd(3.6, 2.6);
        expect(result13).to.equal(6);

        let [result14, error14] = validateValue('integer:wrongProcessor')(2);
        expect(result14).to.equal(null);
        expect(error14).not.equal(null);
    });
});

describe('check "minimum" pattern processor', function () {
    let add = (a) => a + 5;

    it('should properly run if "minimum" processor is given', function () {
        let checkAdd = validateFunction(add, {
            a: 'minimum:5',
        });

        let [result] = checkAdd(55);
        expect(result).to.equal(60);

        let [, error2] = checkAdd(2);
        expect(error2.message).to.equal('The given value is less then 5');

        let [, error3] = checkAdd(0);
        expect(error3.message).to.equal('The given value is less then 5');

        let [, error4] = checkAdd(-2);
        expect(error4.message).to.equal('The given value is less then 5');

        let [result3] = checkAdd('55');
        expect(result3).to.equal(60);

        checkAdd = validateFunction(add, 'minimum:5s');
        let [, error5] = checkAdd(-2);
        expect(error5.message).to.equal('Minimum parameter is not type of number!');

        checkAdd = validateFunction(add, 'minimum:5');
        let [, error6] = checkAdd('as5');
        expect(error6.message).to.equal('Given argument is not type of number!');
    });

    it('should properly run if "maximum" processor is given', function () {
        let checkAdd = validateFunction(add, {
            a: 'maximum:10',
        });

        let [result] = checkAdd(5);
        expect(result).to.equal(10);

        let [, error2] = checkAdd(12);
        expect(error2.message).to.equal('The given value is greater then 10');

        let [result1] = checkAdd(0);
        expect(result1).to.equal(5);

        let [result2] = checkAdd(-2);
        expect(result2).to.equal(3);

        let [result3] = checkAdd('3');
        expect(result3).to.equal(8);

        checkAdd = validateFunction(add, 'maximum:5s');
        let [, error5] = checkAdd(5);
        expect(error5.message).to.equal('Maximum parameter is not type of number!');

        checkAdd = validateFunction(add, 'maximum:10');
        let [, error6] = checkAdd('as5');
        expect(error6.message).to.equal('Given argument is not type of number!');
    });

    it('should properly run if "minLength" processor is given', function () {
        let checkAdd = validateFunction(add, {
            a: 'minLength:2',
        });

        let [, error] = checkAdd('');
        expect(error.message).to.equal('String minimum length must be 2 symbols!');

        let [, error2] = checkAdd(4);
        expect(error2.message).to.equal('String minimum length must be 2 symbols!');

        let [, error3] = checkAdd(0);
        expect(error3.message).to.equal('String minimum length must be 2 symbols!');

        let [result3] = checkAdd(-1);
        expect(result3).to.equal(4);

        let [result4] = checkAdd('-1');
        expect(result4).to.equal('-15');

        checkAdd = validateFunction(add, 'minLength:2s');
        let [, error5] = checkAdd(5);
        expect(error5.message).to.equal('minLength parameter is not type of number!');

        checkAdd = validateFunction(add, 'minLength:2');
        let [result5] = checkAdd('as5');
        expect(result5).to.equal('as55');
    });

    it('should properly run if "maxLength" processor is given', function () {
        let checkAdd = validateFunction(add, {
            a: 'maxLength:3',
        });

        let [result] = checkAdd('');
        expect(result).to.equal('5');

        let [result1] = checkAdd(4);
        expect(result1).to.equal(9);

        let [result2] = checkAdd(0);
        expect(result2).to.equal(5);

        let [result3] = checkAdd(-1);
        expect(result3).to.equal(4);

        let [result4] = checkAdd('-1');
        expect(result4).to.equal('-15');

        let [result5] = checkAdd(123);
        expect(result5).to.equal(128);

        let [, error] = checkAdd(5321);
        expect(error.message).to.equal('String maximum length must be 3 symbols!');

        checkAdd = validateFunction(add, 'maxLength:2s');
        let [, error5] = checkAdd(5);
        expect(error5.message).to.equal('maxLength parameter is not type of number!');

        checkAdd = validateFunction(add, 'maxLength:3');
        let [result6] = checkAdd('as5');
        expect(result6).to.equal('as55');
    });
});

describe('check "string" pattern processor', function () {
    let checkAdd = null;
    function concat(a, b) {
        return a + b;
    }

    it('given empty values should return error', function () {
        checkAdd = validateFunction(concat, {
            a: 'string',
            b: 'string',
        });
        let [, error1] = checkAdd('', 'hi');
        expect(error1).not.equal(null);

        let [, error2] = checkAdd(NaN, 'hi');
        expect(error2).not.equal(null);

        let [, error3] = checkAdd(null, 'hi');
        expect(error3).not.equal(null);

        let [, error4] = checkAdd(false, 'hi');
        expect(error4).not.equal(null);

        let [, error5] = checkAdd(undefined, 'hi');
        expect(error5).not.equal(null);
    });

    it('given a non "string" value should return error', function () {
        checkAdd = validateFunction(concat, {
            a: 'string',
            b: 'string',
        });
        let [, error1] = checkAdd(22, 'hi');
        expect(error1).not.equal(null);

        let [result2, error2] = checkAdd(Infinity, 'hi');
        expect(result2).to.equal(null);
        expect(error2).not.equal(null);

        let [result3, error3] = checkAdd(true, 'hi');
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);

        let [result5, error5] = checkAdd(2.2, 'hi');
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd([], 'hi');
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({}, 'hi');
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);
    });

    it('given a processor should change value', function () {
        checkAdd = validateFunction(concat, {
            a: 'string:toLowerCase',
            b: 'string:toUpperCase',
        });
        let [result] = checkAdd('Hi', 'Fi');
        expect(result).equal('hiFI');

        checkAdd = validateFunction(concat, {
            a: 'string:capitalFirst',
            b: 'string:capitalFirstLetter',
        });
        let [result2] = checkAdd('hi fi', ' hello world');
        expect(result2).equal('Hi fi Hello World');

        let [result3, error3] = validateValue('string:wrongProcessor')('hello');
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);
    });
});

describe('check "boolean" pattern processor', function () {
    let checkAdd = null;
    function invert(b) {
        return !b;
    }

    it('given empty values should return error', function () {
        checkAdd = validateFunction(invert, {
            a: 'boolean',
        });
        let [, error1] = checkAdd('');
        expect(error1).not.equal(null);

        let [, error2] = checkAdd(NaN);
        expect(error2).not.equal(null);

        let [, error3] = checkAdd(null);
        expect(error3).not.equal(null);

        let [, error4] = checkAdd(0);
        expect(error4).not.equal(null);

        let [, error5] = checkAdd(undefined);
        expect(error5).not.equal(null);
    });

    it('given a non "boolean" value should return error', function () {
        checkAdd = validateFunction(invert, 'boolean');

        let [, error1] = checkAdd(22);
        expect(error1).not.equal(null);

        let [result2, error2] = checkAdd(Infinity);
        expect(result2).to.equal(null);
        expect(error2).not.equal(null);

        let [result3, error3] = checkAdd('hi');
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);

        let [result5, error5] = checkAdd(2.2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd([]);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({});
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);
    });

    it('given a processor should change value', function () {
        checkAdd = validateFunction(invert, 'boolean:convert');

        let [result] = checkAdd('Hi');
        expect(result).equal(false);

        let [result2] = checkAdd(2);
        expect(result2).equal(false);

        let [result3] = checkAdd(true);
        expect(result3).equal(false);

        let [result4] = checkAdd(2.2);
        expect(result4).equal(false);

        let [result5] = checkAdd({});
        expect(result5).equal(false);

        let [result6] = checkAdd([]);
        expect(result6).equal(false);

        let [result7] = validateValue('boolean:convert')('true');
        expect(result7).equal(true);

        let [result8] = validateValue('boolean:convert')('false');
        expect(result8).equal(false);

        let [result9, error9] = validateValue('boolean:wrongProcessor')(true);
        expect(result9).to.equal(null);
        expect(error9).not.equal(null);

    });
});

describe('check "array" pattern processor', function () {
    let checkAdd = null;
    function invert(b) {
        return !b;
    }

    it('given empty values should return error', function () {
        checkAdd = validateFunction(invert, {
            a: 'array',
        });
        let [, error1] = checkAdd('');
        expect(error1).not.equal(null);

        let [, error2] = checkAdd(NaN);
        expect(error2).not.equal(null);

        let [, error3] = checkAdd(null);
        expect(error3).not.equal(null);

        let [, error4] = checkAdd(0);
        expect(error4).not.equal(null);

        let [, error5] = checkAdd(undefined);
        expect(error5).not.equal(null);

        let [, error6] = checkAdd(false);
        expect(error6).not.equal(null);
    });

    it('given a non "array" value should return error', function () {
        checkAdd = validateFunction(invert, 'array');

        let [, error1] = checkAdd(22);
        expect(error1).not.equal(null);

        let [result2, error2] = checkAdd(Infinity);
        expect(result2).to.equal(null);
        expect(error2).not.equal(null);

        let [result3, error3] = checkAdd('hi');
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);

        let [result5, error5] = checkAdd(2.2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd(false);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd({});
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);

        let [result8, error8] = checkAdd({a: 1, b: 2});
        expect(result8).to.equal(null);
        expect(error8).not.equal(null);
    });

    it('given an Array value should return same value', function () {
        let [result] = validateValue('array')([]);
        expect(result).to.deep.equal([]);

        let [result2] = validateValue('array')([1,2,3]);
        expect(result2).to.deep.equal([1,2,3]);

    });
});

describe('check "object" pattern processor', function () {
    let checkAdd = null;
    function invert(b) {
        return !b;
    }

    it('given empty values should return error', function () {
        checkAdd = validateFunction(invert, {
            a: 'object',
        });
        let [, error1] = checkAdd('');
        expect(error1).not.equal(null);

        let [, error2] = checkAdd(NaN);
        expect(error2).not.equal(null);

        let [, error3] = checkAdd(null);
        expect(error3).not.equal(null);

        let [, error4] = checkAdd(0);
        expect(error4).not.equal(null);

        let [, error5] = checkAdd(undefined);
        expect(error5).not.equal(null);

        let [, error6] = checkAdd(false);
        expect(error6).not.equal(null);
    });

    it('given a non "object" value should return error', function () {
        checkAdd = validateFunction(invert, 'object');

        let [, error1] = checkAdd(22);
        expect(error1).not.equal(null);

        let [result2, error2] = checkAdd(Infinity);
        expect(result2).to.equal(null);
        expect(error2).not.equal(null);

        let [result3, error3] = checkAdd('hi');
        expect(result3).to.equal(null);
        expect(error3).not.equal(null);

        let [result5, error5] = checkAdd(2.2);
        expect(result5).to.equal(null);
        expect(error5).not.equal(null);

        let [result6, error6] = checkAdd(false);
        expect(result6).to.equal(null);
        expect(error6).not.equal(null);

        let [result7, error7] = checkAdd([]);
        expect(result7).to.equal(null);
        expect(error7).not.equal(null);

        let [result8, error8] = checkAdd([1,2,3,44]);
        expect(result8).to.equal(null);
        expect(error8).not.equal(null);
    });

    it('given an Object value should return same value', function () {
        let [result] = validateValue('object')({});
        expect(result).to.deep.equal({});

        let [result2] = validateValue('object')({a: 3, b: 33});
        expect(result2).to.deep.equal({a: 3, b: 33});

    });
});

describe('check "pattern" pattern processor', function () {
    let checkHello = null;
    function hello(val) {
        return 'hello '+ val;
    }

    it('given empty values should return error', function () {
        checkHello = validateFunction(hello, 'pattern');
        let [, error1] = checkHello('');
        expect(error1).not.equal(null);

        let [, error2] = checkHello(NaN);
        expect(error2).not.equal(null);

        let [, error3] = checkHello(null);
        expect(error3).not.equal(null);

        let [, error4] = checkHello(0);
        expect(error4).not.equal(null);

        let [, error5] = checkHello(undefined);
        expect(error5).not.equal(null);

        let [, error6] = checkHello(false);
        expect(error6).not.equal(null);
    });

    it('given empty pattern should return error', function () {
        checkHello = validateFunction(hello, 'pattern');
        let [, error] = checkHello('bos');
        expect(error).not.equal(null);

        checkHello = validateFunction(hello, 'pattern:');
        let [, error2] = checkHello('bos');
        expect(error2).not.equal(null);

        checkHello = validateFunction(hello, 'pattern: ');
        let [, error3] = checkHello('bos');
        expect(error3).not.equal(null);
    });

    it('given wrong value should return error', function () {
        checkHello = validateFunction(hello, 'pattern:bob');
        let [, error] = checkHello('bos');
        expect(error).not.equal(null);

        checkHello = validateFunction(hello, 'pattern:[\\d]+');
        let [, error2] = checkHello('hi');
        expect(error2).not.equal(null);

        checkHello = validateFunction(hello, 'pattern:[\\D]+');
        let [, error3] = checkHello(34);
        expect(error3).not.equal(null);

        checkHello = validateFunction(hello, 'pattern:/[\\W]+/i');
        let [, error4] = checkHello('tte3st');
        expect(error4).not.equal(null);

        checkHello = validateFunction(hello, 'pattern:/bob/');
        let [, error5] = checkHello('Bob');
        expect(error5).not.equal(null);
    });

    it('given pattern should should return matched values', function () {
        checkHello = validateFunction(hello, 'pattern:bob');
        let [result] = checkHello('bob');
        expect(result).equal('hello bob');

        checkHello = validateFunction(hello, 'pattern:/bob/i');
        let [result2] = checkHello('Bob');
        expect(result2).equal('hello Bob');

        checkHello = validateFunction(hello, 'pattern:/^[\\w]*$/i');
        let [result3] = checkHello('Obama');
        expect(result3).equal('hello Obama');
    });
});

describe('check "default" pattern processor', function () {

    it('given undefined value should return default value', function () {
        let [result] = validateValue('default:true')();
        expect(result).equal(true);

        let [result2] = validateValue('default:false')();
        expect(result2).equal(false);

        let [result3] = validateValue('default:null')();
        expect(result3).equal(null);

        let [result4] = validateValue('default:11')();
        expect(result4).equal('11');

        let [result5] = validateValue('default:11|number:convert')();
        expect(result5).equal(11);

        let [result6] = validateValue('default:11')(undefined);
        expect(result6).equal('11');
    });

    it('given non undefined value should return the value', function () {
        let [result] = validateValue('default:true')(123);
        expect(result).equal(123);

        let [result2] = validateValue('default:false')('123');
        expect(result2).equal('123');

        let [result3] = validateValue('default:null')(false);
        expect(result3).equal(false);

        let [result4] = validateValue('default:11')('true');
        expect(result4).equal('true');

        let [result5] = validateValue('default:11|number:convert')('34');
        expect(result5).equal(34);

        let [result6] = validateValue('default:11')({a:1});
        expect(result6).to.deep.equal({a:1});

        let [result7] = validateValue('default:11')([2,3]);
        expect(result7).to.deep.equal([2,3]);

        let [result8] = validateValue('default:11')({toString: () => undefined});
        expect(result8).to.be.an('object');

        let [result9] = validateValue('default:11')({valueOf: () => undefined});
        expect(result9).to.be.an('object');
    });
});