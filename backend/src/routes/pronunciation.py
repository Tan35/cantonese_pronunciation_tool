from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import ToJyutping

pronunciation_bp = Blueprint('pronunciation', __name__)

@pronunciation_bp.route('/convert', methods=['POST'])
@cross_origin()
def convert_text():
    """
    转换文本为粤语拼音
    支持多种输出格式
    """
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': '请提供要转换的文本'}), 400
        
        text = data['text'].strip()
        if not text:
            return jsonify({'error': '文本不能为空'}), 400
        
        output_format = data.get('format', 'jyutping')
        
        result = {}
        
        if output_format == 'jyutping' or output_format == 'all':
            # 粤拼标注格式：咁(gam3)啱(ngaam1)
            result['jyutping'] = ToJyutping.get_jyutping(text)
        
        if output_format == 'jyutping_text' or output_format == 'all':
            # 纯拼音文本：gam3 ngaam1 lou5
            result['jyutping_text'] = ToJyutping.get_jyutping_text(text)
        
        if output_format == 'jyutping_list' or output_format == 'all':
            # 字符和拼音的元组列表
            result['jyutping_list'] = ToJyutping.get_jyutping_list(text)
        
        if output_format == 'jyutping_candidates' or output_format == 'all':
            # 候选读音
            result['jyutping_candidates'] = ToJyutping.get_jyutping_candidates(text)
        
        if output_format == 'ipa' or output_format == 'all':
            # IPA标注格式
            result['ipa'] = ToJyutping.get_ipa(text)
        
        if output_format == 'ipa_text' or output_format == 'all':
            # 纯IPA文本
            result['ipa_text'] = ToJyutping.get_ipa_text(text)
        
        if output_format == 'ipa_list' or output_format == 'all':
            # IPA列表
            result['ipa_list'] = ToJyutping.get_ipa_list(text)
        
        if output_format == 'ipa_candidates' or output_format == 'all':
            # IPA候选读音
            result['ipa_candidates'] = ToJyutping.get_ipa_candidates(text)
        
        return jsonify({
            'success': True,
            'input_text': text,
            'format': output_format,
            'result': result
        })
    
    except Exception as e:
        return jsonify({'error': f'转换失败: {str(e)}'}), 500

@pronunciation_bp.route('/formats', methods=['GET'])
@cross_origin()
def get_formats():
    """
    获取支持的输出格式列表
    """
    formats = {
        'jyutping': '粤拼标注 - 咁(gam3)啱(ngaam1)',
        'jyutping_text': '纯拼音文本 - gam3 ngaam1',
        'jyutping_list': '拼音列表 - [(字, 拼音), ...]',
        'jyutping_candidates': '候选读音 - [(字, [读音1, 读音2, ...]), ...]',
        'ipa': 'IPA标注 - 咁[kɐm˧]啱[ŋaːm˥]',
        'ipa_text': '纯IPA文本 - kɐm˧.ŋaːm˥',
        'ipa_list': 'IPA列表 - [(字, IPA), ...]',
        'ipa_candidates': 'IPA候选 - [(字, [IPA1, IPA2, ...]), ...]',
        'all': '所有格式'
    }
    
    return jsonify({
        'success': True,
        'formats': formats
    })

@pronunciation_bp.route('/examples', methods=['GET'])
@cross_origin()
def get_examples():
    """
    获取示例文本
    """
    examples = [
        {
            'text': '你好',
            'description': '简单问候'
        },
        {
            'text': '咁啱老世要求佢等陣要開會',
            'description': '日常对话'
        },
        {
            'text': '香港係一個國際金融中心',
            'description': '描述性句子'
        },
        {
            'text': '我鍾意食點心',
            'description': '表达喜好'
        },
        {
            'text': '今日天氣好好',
            'description': '天气描述'
        }
    ]
    
    return jsonify({
        'success': True,
        'examples': examples
    })

@pronunciation_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """
    健康检查接口
    """
    return jsonify({
        'success': True,
        'message': '粤语拼音转换服务运行正常',
        'version': '1.0.0'
    })

