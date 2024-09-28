"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
class Substitutions {
    constructor(html) {
        this.shortDayNames = ["pon", "wt", "śr", "czw", "pt", "sob", "nie"];
        this.$ = (0, cheerio_1.load)(html);
    }
    parseLessonNumber(lesson) {
        const [number, timeRange] = lesson.split(",");
        return {
            number: parseInt(number),
            timeRange: timeRange.trim(),
        };
    }
    parseSubstituts(entry) {
        const parts = entry.trim().split(/\s+/);
        let subjectWords = [];
        let teacher = null;
        let room = null;
        let groupName;
        let match;
        const teacherRegex = /^\p{Lu}\p{L}$/u;
        const roomRegex = /^(?:3[0-7]|[3-9]|[12][0-9]|W.*|G.*|WG.*)$/;
        const groupNameRegex = /^-([\d/]+|[A-Z])$|^(\d+[A-Za-z]+)$/;
        for (const word of parts) {
            if (!teacher && teacherRegex.test(word)) {
                teacher = word;
            }
            else if (!room && roomRegex.test(word)) {
                room = word;
            }
            else if (!groupName && (match = word.match(groupNameRegex))) {
                groupName = match[1] || match[2];
            }
            else {
                subjectWords.push(word);
            }
        }
        let subject = subjectWords.join(" ");
        const subjectRegex = /^(.+?)(?:-([\d/]+|[A-Z]))?$/;
        match = subject.match(subjectRegex);
        if (match) {
            subject = match[1].trim();
            if (!groupName && match[2]) {
                groupName = match[2];
            }
        }
        if (!subject || !room) {
            return null;
        }
        return {
            subject,
            ...(teacher ? { teacher } : {}),
            room,
            ...(groupName ? { groupName } : {}),
        };
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
                const [lesson, teacher, classValue, subject, room, caseValue, message] = columns.map((_index, column) => this.$(column).text().trim()).get();
                const lessonSubstitute = (message === null || message === void 0 ? void 0 : message.length) > 0
                    ? message
                        .split("\n")
                        .map(this.parseSubstituts)
                        .filter((entry) => entry !== null)
                    : [];
                if (lesson) {
                    substitutions.push({
                        ...this.parseLessonNumber(lesson),
                        teacher,
                        subject,
                        class: classValue,
                        room,
                        case: caseValue,
                        ...(lessonSubstitute.length > 0 ? { lessonSubstitute } : {}),
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
exports.default = Substitutions;
