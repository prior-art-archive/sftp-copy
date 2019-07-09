export const isObjectEmpty = object => object.size === 0

export const isObjectValidExtension = (object) => {
  const srcKey = object.key.replace(/\+/g, ' ');
  const extension = srcKey.split('.').pop().toLowerCase();
  const allowedExtensions = ['html', 'htm', 'pdf'];
  return allowedExtensions.indexOf(extension) === -1
}

export const getCompanySlug = object => object.key.split('/')[0];

export const getOrganizationId = async (companySlug) => request({
  uri: `${process.env.idResolverUrl}?slug=${companySlug}`,
  json: true,
});

export const getSrcHead = async (srcBucket, srcKey) = new Promise((resolve, reject) => {
    s3.headObject({
      Bucket: srcBucket,
      Key: srcKey
    }, function(err, data) {
      if (err) {
        logger.error(err)
        reject(err);
      }
      resolve(data);
    });
  });
