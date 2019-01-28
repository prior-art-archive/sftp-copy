var AWS = require('aws-sdk');
var uuidv4 = require('uuid/v4');
var request = require('request-promise');

var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
	/* Validate file size */
	if (event.Records[0].s3.object.size === 0) {
		return callback(null, '0 Size');
	}

	const srcBucket = process.env.sourceBucket;
	const srcKey = event.Records[0].s3.object.key.replace(/\+/g, ' ');
	const extension = srcKey.split('.').pop().toLowerCase();
	const allowedExtensions = ['html', 'htm', 'pdf'];
	if (allowedExtensions.indexOf(extension) === -1) {
		return callback(null, 'Invalid Extension');
	}

	const companySlug = event.Records[0].s3.object.key.split('/')[0];

	const getOrgId = request({
		uri: `${process.env.idResolverUrl}?slug=${companySlug}`,
		json: true,
	});
 	const getSrcHead = new Promise((resolve, reject)=> {
 		s3.headObject({
			Bucket: srcBucket,
			Key: srcKey
		}, function(err, data) {
			if (err) { reject(err); }
			resolve(data);
		});
 	});
 	Promise.all([getOrgId, getSrcHead])
	.then(([organizationId, srcHead])=> {
		const documentId = uuidv4();
		const destBucket = 'assets.priorartarchive.org';
		const destKey = `uploads/${organizationId}/${documentId}.${extension}`;
		s3.copyObject({ 
			CopySource: srcBucket + '/' + srcKey,
			Bucket: destBucket,
			Key: destKey,
			ContentType: srcHead.ContentType,
			Metadata: {
				...srcHead.Metadata,
				'x-amz-meta-document-id': documentId,
				'x-amz-meta-original-filename': srcKey.replace(`${companySlug}/`, ''),
			},
			MetadataDirective: 'REPLACE'
		}, (copyErr, copyData)=> {
			if (copyErr) { callback(copyErr, null); }
			callback(null, `Copied ${srcKey} to ${destKey}`);
		});
	})
	.catch((resolveErr)=> {
		callback(resolveErr, null);
	});
};
