/************************************************************************
 Copyright 2020 eBay Inc.
 Author/Developer: Amir Langer

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 **************************************************************************/
// Remove arbitrary long number from lambda stack trace when using -XX:+UnlockDiagnosticVMOptions -XX:+ShowHiddenFrames
// com.ebay.Foo$$Lambda$1/791452441.run(<Unknown>:1000001)
// com.ebay.Foo$$Lambda$16/0x000000080009f040.accept(<Unknown>:1000008)
// Number assigned when creating the lambda still stays (is it always right?)
// com.ebay.Foo.lambda$main$0
// sun/reflect/GeneratedMethodAccessor116.invoke
// sun/reflect/GeneratedMethodAccessor119.invoke

function FG_Filter_Java8() {}

FG_Filter_Java8.prototype.filter = function(trace) {
    return trace.replace(/\$\$Lambda\$(\d+)\/(\w+)\./g, "$$$Lambda$$1/_.").
                replace(/sun\/reflect\/GeneratedMethodAccessor(\d+)\./g, "sun/reflect/GeneratedMethodAccessor_.");
};
