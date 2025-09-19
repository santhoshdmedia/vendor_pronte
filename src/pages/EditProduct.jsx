import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Form, Input, Select, InputNumber, Button, Card, Typography, Space, message, Row, Col, Divider, Spin } from 'antd';
import { getSingleProduct, updateProduct } from '../Helper/apiHelper';
import UploadHelper from '../Helper/UploadHelper';
import ShowImages from '../Helper/ShowImages';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [image_path, setImagePath] = useState([]);
  const [sku, setSku] = useState('');
  const [regeneratingSku, setRegeneratingSku] = useState(false);

  const categories = [
    'Electronics',
    'Accessories',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Automotive'
  ];

  const divisions = [
    'North',
    'South',
    'East',
    'West',
    'Central'
  ];

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Function to generate a random SKU
  const generateSKU = () => {
    setRegeneratingSku(true);
    // Simple SKU generator - you might want to customize this
    const prefix = productData?.category?.substring(0, 3).toUpperCase() || 'PRO';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newSku = `${prefix}-${randomNum}`;
    setSku(newSku);
    setTimeout(() => setRegeneratingSku(false), 500);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getSingleProduct(id);
      const product = response.data.data;
      
      setProductData(product);
      setSku(product.sku || '');
      
      // Set form values
      form.setFieldsValue({
        productName: product.name,
        category: product.category,
        sellerPrice: product.sellerPrice,
        quantity: product.quantity,
        description: product.description,
        division: product.division
      });

      // Set initial images
      if (product.Product_image && product.Product_image.length > 0) {
        setImagePath(product.Product_image);
      }
      
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to load product');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isDraft = false) => {
    try {
      const values = await form.validateFields();
      
      // Validate images
      if (image_path.length === 0 && !isDraft) {
        message.error('At least one image is required for active products');
        return;
      }
      
      setLoading(true);

      // Prepare product data for submission
      const updatedProductData = {
        name: values.productName,
        category: values.category,
        sellerPrice: values.sellerPrice,
        quantity: values.quantity,
        description: values.description,
        division: values.division,
        sku: sku,
        Product_image: image_path,
        status: isDraft ? 'draft' : 'active'
      };

      await updateProduct(id, updatedProductData);
      message.success(`Product ${isDraft ? 'saved as draft' : 'updated'} successfully!`);
      navigate('/inventory');
      
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill all required fields correctly');
      } else {
        message.error(error.response?.data?.message || 'Failed to update product');
      }
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !productData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <Space>
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/inventory')}
              className="flex items-center"
            >
              Back to Inventory
            </Button>
          </Space>
          <Title level={2} className="mt-4">Edit Product</Title>
          <Text type="secondary">Update the product details below</Text>
        </Card>

        <Row gutter={24}>
          {/* Left Column - Product Details */}
          <Col xs={24} lg={14}>
            <Card title="Product Information" className="mb-6">
              <Form
                form={form}
                layout="vertical"
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="productName"
                      label="Product Name"
                      rules={[{ required: true, message: 'Product name is required' }]}
                    >
                      <Input placeholder="Enter product name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="SKU">
                      <Input 
                        value={sku} 
                        onChange={(e) => setSku(e.target.value)}
                        size="large"
                        suffix={
                          <Button 
                            type="link" 
                            onClick={generateSKU}
                            loading={regeneratingSku}
                            size="small"
                          >
                            Regenerate
                          </Button>
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="category"
                      label="Category"
                      rules={[{ required: true, message: 'Category is required' }]}
                    >
                      <Select placeholder="Select a category" size="large">
                        {categories.map(category => (
                          <Option key={category} value={category}>{category}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="division"
                      label="Division"
                      rules={[{ required: true, message: 'Division is required' }]}
                    >
                      <Select placeholder="Select a division" size="large">
                        {divisions.map(division => (
                          <Option key={division} value={division}>{division}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="sellerPrice"
                      label="Seller Price (₹)"
                      rules={[
                        { required: true, message: 'Seller price is required' },
                        { type: 'number', min: 0, message: 'Price must be positive' }
                      ]}
                    >
                      <InputNumber
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        className="w-full"
                        size="large"
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="quantity"
                      label="Quantity"
                      rules={[
                        { required: true, message: 'Quantity is required' },
                        { type: 'number', min: 0, message: 'Quantity must be positive' }
                      ]}
                    >
                      <InputNumber
                        placeholder="Enter quantity"
                        min={0}
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Description is required' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter product description"
                    size="large"
                  />
                </Form.Item>

                <Form.Item 
                  label="Product Images"
                  required
                >
                  <div className="flex flex-col gap-4">
                    {image_path.length > 0 && (
                      <ShowImages path={image_path} setImage={setImagePath} multiple={true} />
                    )}
                    
                    {image_path.length < 5 && (
                      <UploadHelper 
                        setImagePath={setImagePath} 
                        image_path={image_path} 
                        multiple={true} 
                        max={5} 
                      />
                    )}
                    <div className="text-sm text-gray-500">
                      {image_path.length} of 5 images uploaded
                      {image_path.length === 0 && " (at least one required for active products)"}
                    </div>
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Right Column - Actions */}
          <Col xs={24} lg={10}>
            <Card title="Actions">
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={() => handleSave(false)}
                  className="w-full"
                >
                  Update Product
                </Button>
                
                <Button
                  size="large"
                  loading={loading}
                  onClick={() => handleSave(true)}
                  className="w-full"
                >
                  Save as Draft
                </Button>
                
                <Button
                  size="large"
                  onClick={() => navigate('/inventory')}
                  className="w-full"
                >
                  Cancel
                </Button>
              </Space>
              
              <Divider />
              
              <Text type="secondary" className="text-xs">
                Required fields are marked with an asterisk (*). Draft products can be saved without images.
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditProduct;