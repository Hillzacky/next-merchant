import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

async function up() {
  const m = await sql`
    CREATE TABLE IF NOT EXISTS merchant(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(16) NULL
    )
  `
  return m
}

async function getData(phone = null) {
  const m = await sql`
    select
      id,
      name,
      address,
      phone
    from merchant
    where phone != ${ phone }
  `
  return m
}


async function setData({ name, address, phone }) {
  const m = await sql`
    insert into merchant
      (name, address, phone)
    values
      (${ name }, ${ address }, ${ phone })
    returning name
  `
  return m
}

module.exports = { up, getData, setData }