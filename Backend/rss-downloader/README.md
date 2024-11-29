Câu lệnh Mongodb kiểm tra xem có bản trùng lặp nào ko:

db.test_json_xml.aggregate([
{
$group: {
_id: { title: "$title", arrangedCategory: "$arrangedCategory", guid: "$guid"},
count: { $sum: 1 },
duplicates: { $push: "$_id" }
}
},
{
$match: {
count: { $gt: 1 }
}
}
]);

Câu lệnh Mongodb để xóa các bản trùng:
db.test_json_xml.aggregate([
{
$group: {
_id: { title: "$title", arrangedCategory: "$arrangedCategory", guid: "$guid" },
count: { $sum: 1 },
duplicates: { $push: "$_id" }
}
},
{
$match: {
count: { $gt: 1 }
}
}
]).forEach(doc => {
const duplicates = doc.duplicates;
duplicates.shift();
db.test_json_xml.deleteMany({ \_id: { $in: duplicates } });
});
