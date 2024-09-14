"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
class SubstitutionsPage {
    constructor(html) {
        this.shortDayNames = ["pon", "wt", "śr", "czw", "pt", "sob", "nie"];
        this.$ = (0, cheerio_1.load)(html);
    }
    parseSubstitutionSite() {
        const timeRange = this.$("h2").text().trim();
        const heading = this.$("h1").text().trim();
        const tables = [];
        this.$("table").each((_index, table) => {
            var _a, _b;
            const rows = this.$(table).find("tr");
            const tableDate = rows.first().text().trim();
            const substitutions = [];
            rows.slice(1).each((_i, row) => {
                const columns = this.$(row).find("td");
                const [lesson, teacher, branch, subject, classValue, caseValue, message,] = columns.map((_index, column) => this.$(column).text().trim()).get();
                if (lesson) {
                    substitutions.push({
                        lesson,
                        teacher,
                        branch,
                        subject,
                        class: classValue,
                        case: caseValue,
                        message,
                    });
                }
            });
            const match = tableDate.match(/\([^)]*\)/i);
            const weekday = match
                ? this.shortDayNames.indexOf((_b = (_a = match[0]) === null || _a === void 0 ? void 0 : _a.substring(1)) === null || _b === void 0 ? void 0 : _b.replace(".)", ""))
                : -1;
            tables.push({
                time: tableDate,
                weekday,
                substitutions,
            });
        });
        return {
            heading,
            timeRange,
            tables,
        };
    }
}
exports.default = SubstitutionsPage;
