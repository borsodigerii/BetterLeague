export default async function urlFromStream(response: Promise<Response>) {
  let res: Response = await response;
  if (res.ok) {
    let blob = await res.blob();

    return URL.createObjectURL(blob);
  } else {
    return false;
  }
}
