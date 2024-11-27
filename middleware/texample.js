texample = async (task) => {
  const fs = require("fs");
  let arr = []
  try {
    for (let i = 0; i < task.test_count; i++) {
      let inp = await fs.readFileSync(`./testcase/${task.code}/input${i}.txt`)
      let out = await fs.readFileSync(`./testcase/${task.code}/output${i}.txt`)
      arr.push({ inp, out })
    }
  } catch (err) {
    console.log("same read file has error! ")
  }

  return arr;
}

module.exports = {
  texample
}