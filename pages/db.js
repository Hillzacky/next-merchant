

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